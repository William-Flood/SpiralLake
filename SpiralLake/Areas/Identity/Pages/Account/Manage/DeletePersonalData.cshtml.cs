using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using SpiralLake.Areas.Identity.Data;
using SpiralLake.Data;

namespace SpiralLake.Areas.Identity.Pages.Account.Manage
{
    [Authorize(Policy = "Registered")]
    public class DeletePersonalDataModel : PageModel
    {
        private readonly UserManager<SpiralLakeUser> _userManager;
        private readonly SignInManager<SpiralLakeUser> _signInManager;
        private readonly ILogger<DeletePersonalDataModel> _logger;
        private readonly SpiralLakeContext _context;

        public DeletePersonalDataModel(
            UserManager<SpiralLakeUser> userManager,
            SignInManager<SpiralLakeUser> signInManager,
            ILogger<DeletePersonalDataModel> logger,
            SpiralLakeContext context) {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
            _context = context;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public class InputModel
        {
            [Required]
            [DataType(DataType.Password)]
            public string Password { get; set; }
        }

        public bool RequirePassword { get; set; }

        public async Task<IActionResult> OnGet()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId")).Value;
            var user = _context.Users.Where(u => u.Id.Equals(userId)).FirstOrDefault();
            if (user == null)
            {
                return NotFound($"Unable to load user with ID '{userId}'.");
            }

            RequirePassword = await _userManager.HasPasswordAsync(user);
            return Page();
        }

        public async Task<IActionResult> OnPostAsync() 
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId")).Value;
            var user = _context.Users.Where(u => u.Id.Equals(userId)).FirstOrDefault();
            if (user == null)
            {
                return NotFound($"Unable to load user with ID '{userId}'.");
            }

            RequirePassword = await _userManager.HasPasswordAsync(user);
            if (RequirePassword)
            {
                if (!await _userManager.CheckPasswordAsync(user, Input.Password))
                {
                    ModelState.AddModelError(string.Empty, "Incorrect password.");
                    return Page();
                }
            }
            var userMesmers = _context.Mesmers.Where(m => m.CreatorID.Equals(userId));
            foreach(var mesmerToDelete in userMesmers) {
                _context.Mesmers.Remove(mesmerToDelete);
            }
            _context.SaveChanges();
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Unexpected error occurred deleting user with ID '{userId}'.");
            }

            await _signInManager.SignOutAsync();
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            _logger.LogInformation("User with ID '{UserId}' deleted themselves.", userId);

            return Redirect("~/");
        }
    }
}
