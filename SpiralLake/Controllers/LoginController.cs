using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpiralLake.Areas.Identity.Data;
using SpiralLake.Data;

namespace SpiralLake.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private UserManager<SpiralLakeUser> _userManager;
        private SignInManager<SpiralLakeUser> _signInManager;
        private ILogger<WelcomeController> _logger;
        private IEmailSender _emailSender;

        public LoginController(
            UserManager<SpiralLakeUser> userManager,
            SignInManager<SpiralLakeUser> signInManager,
            ILogger<WelcomeController> logger,
            IEmailSender emailSender) {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
            _emailSender = emailSender;
        }
        [HttpPost]
        public async Task<String> CheckLogin(SpiralLake.Controllers.WelcomeModel loginModel) {
            var result = await _signInManager.PasswordSignInAsync(loginModel.UserName, loginModel.Password, false, lockoutOnFailure: false);
            if (result.Succeeded) {
                return "Success";
            } else {
                return "Failure";
            }

        }
    }
}
