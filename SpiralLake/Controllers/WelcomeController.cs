using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpiralLake.Areas.Identity.Data;
using SpiralLake.Data;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using Microsoft.AspNetCore.Identity.UI.Services;
using System.Text.Encodings.Web;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace SpiralLake.Controllers
{
    public class WelcomeModel
    {
        public String UserName { get; set; }
        public String Email { get; set; }
        public String Password { get; set; }
        public String ConfirmPassword { get; set; }
        public String TOSAgreed { get; set; }
    }

    [AllowAnonymous()]
    public class WelcomeController : Controller
    {
        private readonly UserManager<SpiralLakeUser> _userManager;
        private readonly SignInManager<SpiralLakeUser> _signInManager;
        private readonly ILogger<WelcomeController> _logger;
        private readonly SpiralLakeContext _context;
        private readonly IEmailSender _emailSender;
        public static String AdminName { get; set; }
        public WelcomeController(
            UserManager<SpiralLakeUser> userManager,
            SignInManager<SpiralLakeUser> signInManager,
            ILogger<WelcomeController> logger,
            SpiralLakeContext context,
            IEmailSender emailSender) {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
            _context = context;
            _emailSender = emailSender;
        }

        [AllowAnonymous()]
        public async Task<IActionResult> Index() {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) {
                return View("Views/Welcome/Index.cshtml");
            }
            return View();
        }

        public async Task<IActionResult> Login(WelcomeModel loginModel) {
            var foundUser = _context.Users.Where(u => u.UserName.Equals(loginModel.UserName)).FirstOrDefault();
            var result = await _signInManager.PasswordSignInAsync(loginModel.UserName, loginModel.Password, true, lockoutOnFailure: false);
            if (result.Succeeded) {
                _logger.LogInformation("User logged in.");
                var claims = new List<Claim>
                {
                    new Claim("UserId", foundUser.Id),
                    new Claim("Authenticated", "User"),
                    new Claim(ClaimTypes.Role, "User"),
                };

                var claimsIdentity = new ClaimsIdentity(
                    claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties {  };
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);
                return Redirect("/Home/");
                // return Redirect("/");
            }
            if (result.IsLockedOut) {
                _logger.LogWarning("User account locked out.");
                throw new NotImplementedException("Lockout not enabled");
            }
            return Redirect("/Welcome/");
        }

        public async Task<IActionResult> Register(WelcomeModel loginModel) {
            var foundUser = _context.Users.Where(u => u.UserName.Equals(loginModel.UserName)).FirstOrDefault();
            if (null == foundUser) {
                if (loginModel.Password.Equals(loginModel.ConfirmPassword)) {
                    var user = new SpiralLakeUser { UserName = loginModel.UserName, Email = loginModel.Email };
                    var result = await _userManager.CreateAsync(user, loginModel.Password);
                    if (result.Succeeded) {
                        _logger.LogInformation("User created a new account with password.");

                        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                        var callbackUrl = Url.Action("Confirmed", "Welcome", new { userId = user.Id, code = code }, this.Request.Scheme);
                        await _emailSender.SendEmailAsync(loginModel.Email, "Confirm your email",
                            $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>.");

                        if (_userManager.Options.SignIn.RequireConfirmedAccount) {
                            return View("/Views/Welcome/PendingConfirmation.cshtml");
                        } else {
                            await _signInManager.SignInAsync(user, isPersistent: false);
                            return LocalRedirect(Request.Path.Value);
                        }
                    }
                    foreach (var error in result.Errors) {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                }

            }
            return View("/Views/Welcome/Index");
        }

        public async Task<IActionResult> Confirmed(string userId, string code) {
            if (userId == null || code == null) {
                return View("/Views/Welcome/Index");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) {
                return View("/Views/Welcome/Index");
            }

            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
            var result = await _userManager.ConfirmEmailAsync(user, code);
            return View();
        }

        public async Task<IActionResult> Guest() {
            var claims = new List<Claim>
            {
                    new Claim("Authenticated", "Guest"),
                    new Claim(ClaimTypes.Role, "Guest"),
             };

            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties { };
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);
            return Redirect("/Home/");
            // return View("/Views/Home/Index.cshtml");
        }
    }
}
