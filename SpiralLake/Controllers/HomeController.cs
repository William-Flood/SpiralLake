using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpiralLake.Areas.Identity.Data;
using SpiralLake.Models;

namespace SpiralLake.Controllers
{
    [Authorize(Policy = "HasAuthentication")]
    public class HomeController : Controller {
        private readonly UserManager<SpiralLakeUser> _userManager;
        private readonly SignInManager<SpiralLakeUser> _signInManager;
        private readonly ILogger<HomeController> _logger;

        public HomeController(
            UserManager<SpiralLakeUser> userManager,
            SignInManager<SpiralLakeUser> signInManager,
            ILogger<HomeController> logger) {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
        }

        [Route("/")]
        [Route("/Home/")]
        [Route("/Home/Index/{searchText}")]
        public async Task<IActionResult> Index(String searchText) {
            ViewData["Search"] = searchText;
            return View();
        }

        public IActionResult Privacy() {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error() {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public IActionResult FAQ() {
            return View();
        }
    }
}
