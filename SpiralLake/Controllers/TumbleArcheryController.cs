using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Controllers
{
    public class TumbleArcheryController : Controller
    {
        public IActionResult Index() {
            return View();
        }
    }
}
