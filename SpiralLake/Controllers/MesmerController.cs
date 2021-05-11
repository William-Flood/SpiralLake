using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SpiralLake.Areas.Identity.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace SpiralLake.Controllers
{
    public class MesmerController : Controller
    {
        private SpiralLake.Data.SpiralLakeContext _context;
        private UserManager<SpiralLakeUser> _userManager;
        public MesmerController (SpiralLake.Data.SpiralLakeContext spiralLakeContext,
            UserManager<SpiralLakeUser> _userManager) {
            this._context = spiralLakeContext;
            this._userManager = _userManager;
        }

        [HttpGet]
        [Route("/Mesmer/Add")]
        [Authorize(Policy = "Registered")]
        public IActionResult Index() {
            return View("/Views/Mesmer/AddUpdate.cshtml", new SpiralLake.Models.MesmerAndText { ButtonLabel = "Add"});
        }

        [HttpPost]
        [Route("/Mesmer/Add")]
        [Authorize(Policy = "Registered")]
        public IActionResult Add(SpiralLake.Models.MesmerAndText mesmerAndText) {
            mesmerAndText.Mesmer.Name = HttpUtility.HtmlEncode(mesmerAndText.Mesmer.Name);
            mesmerAndText.Mesmer.Description = HttpUtility.HtmlEncode(mesmerAndText.Mesmer.Description.Replace("\r","").Replace("\n", " "));
            var seekingName = true;
            var randomBytes = new Byte[128];
            var rng = new System.Random();
            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId")).Value;
            while (seekingName) {
                rng.NextBytes(randomBytes);
                var candidateName = System.Convert.ToBase64String(randomBytes).Replace("+","_").Replace("=","~").Replace("/","-");
                if (!_context.Mesmers.Where(m => m.ID.Equals(candidateName)).Any()) {
                    mesmerAndText.Mesmer.CreatorID = userId;
                    mesmerAndText.Mesmer.ID = candidateName;
                    _context.Mesmers.Add(mesmerAndText.Mesmer);
                    seekingName = false;
                }
            }
            var mesmerLines = mesmerAndText.MesmerText.Replace("\r", "").Split("\n");
            var lineIndex = 0;
            foreach (var line in mesmerLines) {
                var htmlEncodedLine = HttpUtility.HtmlEncode(line);
                _context.MesmerTexts.Add(new Data.MesmerText { LineID = lineIndex, MesmerID = mesmerAndText.Mesmer.ID, Text = htmlEncodedLine, UserID = userId });
                lineIndex++;
            }
            if(null != mesmerAndText.Tags) {
                var mesmerTags = mesmerAndText.Tags.Split(" ");
                foreach (var tag in mesmerTags) {
                    if (!"".Equals(tag)) {
                        var encodedTag = HttpUtility.HtmlEncode(tag);
                        if (!_context.MesmerTags.Where(mt => mt.MesmerID.Equals(mesmerAndText.Mesmer.ID) && mt.Tag.Equals(encodedTag)).Any()) {
                            _context.MesmerTags.Add(new Data.MesmerTag { MesmerID = mesmerAndText.Mesmer.ID, Tag = encodedTag });
                            _context.SaveChanges();
                        }
                    }
                }
            }
            _context.SaveChanges();
            return View("/Views/Mesmer/AddUpdate.cshtml", new SpiralLake.Models.MesmerAndText { ButtonLabel = "Add", Notification = "Mesmer added", Mesmer = mesmerAndText.Mesmer, MesmerText = mesmerAndText.MesmerText });
        }

        [HttpGet]
        [Route("/Mesmer/View/{id}")]
        public IActionResult View(String id) {
            var mesmerText = GetMesmerAndText(id, increment: true);
            return View("/Views/Mesmer/View.cshtml", mesmerText);
        }

        public class ReportModel
        {
            public String Reason { get; set; }
            public String MesmerID { get; set; }
        }

        [HttpPost]
        [Route("/Mesmer/Report")]
        public IActionResult Report(ReportModel reportModel) {
            _context.MesmerReportFlags.Add(new Data.MesmerReportFlag { MesmerID = reportModel.MesmerID, Reason = reportModel.Reason });
            var mesmerText = GetMesmerAndText(reportModel.MesmerID);
            mesmerText.Notification = "Report added.  We will review the mesmer and take action accordingly";
            return View("/Views/Mesmer/View.cshtml", mesmerText);
        }

        private SpiralLake.Models.MesmerAndText GetMesmerAndText(String id, bool increment = false, bool includeTags = false) {
            var loadedMesmer = _context.Mesmers.Where(m => m.ID.Equals(id)).FirstOrDefault();
            List<SpiralLake.Data.MesmerText> mesmerLines;

            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId"))?.Value;
            if (_context.MesmerTexts.Where(mt => mt.MesmerID.Equals(id) && mt.UserID.Equals(userId)).Any()) {
                mesmerLines = _context.MesmerTexts.Where(mt => mt.MesmerID.Equals(id) && mt.UserID.Equals(userId)).OrderBy(mt => mt.LineID).ToList();
            } else {
                mesmerLines = _context.MesmerTexts.Where(mt => mt.MesmerID.Equals(id) && mt.UserID.Equals(loadedMesmer.CreatorID)).OrderBy(mt => mt.LineID).ToList();
            }
            var mesmerLineStrings = new List<String>();
            foreach (var line in mesmerLines) {
                mesmerLineStrings.Add(line.Text);
            }
            var text = String.Join("\r\n", mesmerLineStrings);
            if (increment) {
                loadedMesmer.Views++;
                _context.SaveChanges();
            }
            var results = new SpiralLake.Models.MesmerAndText { Mesmer = loadedMesmer, MesmerText = text };
            if (includeTags) {
                var mesmerTags = _context.MesmerTags.Where(m => m.MesmerID == loadedMesmer.ID).Select(m=>m.Tag);
                results.Tags = String.Join(" ", mesmerTags);
            }
            return results;
        }



        [HttpGet]
        [Route("/Mesmer/Submissions")]
        [Authorize(Policy = "Registered")]
        public IActionResult Submissions(String id) {
            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId")).Value;
            var userMesmers = _context.Mesmers.Where(m => m.CreatorID.Equals(userId));
            return View(userMesmers);
        }

        [HttpGet]
        [Route("/Mesmer/Update/{id}")]
        [Authorize(Policy = "Registered")]
        public IActionResult Update(String id) {
            var mesmerText = GetMesmerAndText(id, includeTags: true);
            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId")).Value;
            if (!mesmerText.Mesmer.CreatorID.Equals(userId)) {
                return Redirect("/Mesmer/Submissions");
            }
            mesmerText.ButtonLabel = "Update";
            return View("/Views/Mesmer/AddUpdate.cshtml", mesmerText);
        }

        [HttpPost]
        [Route("/Mesmer/Update/{id}")]
        [Authorize(Policy = "Registered")]
        public IActionResult Update(SpiralLake.Models.MesmerAndText mesmerAndText) {
            var updatingMesmer = _context.Mesmers.Where(m=>m.ID == mesmerAndText.Mesmer.ID).FirstOrDefault();
            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId")).Value;
            if (!updatingMesmer.CreatorID.Equals(userId)) {
                return Redirect("/Account/Logoff");
            }
            updatingMesmer.Name = HttpUtility.HtmlEncode(mesmerAndText.Mesmer.Name);
            updatingMesmer.Description = HttpUtility.HtmlEncode(mesmerAndText.Mesmer.Description.Replace("\r", "").Replace("\n", " "));
            var mesmerLines = mesmerAndText.MesmerText.Replace("\r", "").Split("\n");
            var lineIndex = 0;
            var existingLines = _context.MesmerTexts.Where(mt => mt.MesmerID == updatingMesmer.ID);
            foreach(var line in existingLines) {
                _context.MesmerTexts.Remove(line);
            }
            foreach (var line in mesmerLines) {
                var htmlEncodedLine = HttpUtility.HtmlEncode(line);
                _context.MesmerTexts.Add(new Data.MesmerText { LineID = lineIndex, MesmerID = updatingMesmer.ID, Text = htmlEncodedLine, UserID = userId });
                lineIndex++;
            }
            var existingTags = _context.MesmerTags.Where(mt => mt.MesmerID == updatingMesmer.ID);
            foreach (var tag in existingTags) {
                _context.MesmerTags.Remove(tag);
            }
            _context.SaveChanges();
            if (null != mesmerAndText.Tags) {
                var mesmerTags = mesmerAndText.Tags.Split(" ");
                foreach (var tag in mesmerTags) {
                    if (!"".Equals(tag)) {
                        var encodedTag = HttpUtility.HtmlEncode(tag);
                        if (!_context.MesmerTags.Where(mt => mt.MesmerID.Equals(updatingMesmer.ID) && mt.Tag.Equals(encodedTag)).Any()) {
                            _context.MesmerTags.Add(new Data.MesmerTag { MesmerID = updatingMesmer.ID, Tag = encodedTag });
                            _context.SaveChanges();
                        }
                    }
                }
            }
            return View("/Views/Mesmer/AddUpdate.cshtml", new SpiralLake.Models.MesmerAndText { ButtonLabel = "Update", Notification = "Mesmer updated", Mesmer = updatingMesmer, MesmerText = mesmerAndText.MesmerText });
        }

        [HttpGet]
        [Route("/Mesmer/Delete/{id}")]
        [Authorize(Policy = "Registered")]
        public IActionResult Delete(String id) {
            var deletingMesmer = _context.Mesmers.Where(m => m.ID.Equals(id)).FirstOrDefault();
            var userId = User.Claims.FirstOrDefault(c => c.Type.Equals("UserId")).Value;
            if (!deletingMesmer.CreatorID.Equals(userId)) {
                return Redirect("/Account/Logoff");
            }
            _context.Remove(deletingMesmer);
            _context.SaveChanges();
            return Redirect("/Mesmer/Submissions");
        }
    }
}
