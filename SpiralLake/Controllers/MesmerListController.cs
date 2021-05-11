using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpiralLake.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace SpiralLake.Views.Welcome
{
    [Route("api/[controller]")]
    [ApiController]
    public class MesmerListController : ControllerBase
    {
        class MesmerOrderer
        {
            public Mesmer ToSort { get; set; }
            public double SortTally { get; set; }
            public int CaptureTally { get; set; }
        }
        private readonly SpiralLakeContext _context;
        public MesmerListController(
            SpiralLakeContext context
            ) {
            this._context = context;
        }
        public List<Mesmer> GetMesmers([FromBody] List<String> SearchTerms) {
            var returnedMesmers = new List<Mesmer>();
            // mesmerTally provides memorization; allows mesmers in mesmerSorter to be retrieved without looping through mesmerSorter itself
            var mesmerTally = new Dictionary<String, MesmerOrderer>();
            var mesmerSorter = new List<MesmerOrderer>();
            SearchTerms.Remove("");
            var capturesRequired = 0;
            if(0 < SearchTerms.Count) {
                foreach(var term in SearchTerms) {
                    if(!"".Equals(term)) {
                        var currentPassIDs = new List<String>();
                        capturesRequired++;
                        var mesmersByName = _context.Mesmers.Where(m => m.Name.Contains(term));
                        var mesmersByDescription = _context.Mesmers.Where(m=>m.Description.Contains(term));
                        var mesmersByTags = _context.MesmerTags.Where(mt => mt.Tag.Equals(term)).Include(mt=>mt.Mesmer).Select(mt=> mt.Mesmer);
                        foreach(var foundMesmer in mesmersByName) {
                            if(mesmerTally.ContainsKey(foundMesmer.ID)) {
                                mesmerTally[foundMesmer.ID].SortTally = mesmerTally[foundMesmer.ID].SortTally + 1.0;
                                if(!currentPassIDs.Contains(foundMesmer.ID)) {
                                    currentPassIDs.Add(foundMesmer.ID);
                                    mesmerTally[foundMesmer.ID].CaptureTally++;
                                }
                            } else {
                                var thisMesmerOrder = new MesmerOrderer { ToSort = foundMesmer, SortTally = 1.0, CaptureTally = 1 };
                                mesmerTally.Add(foundMesmer.ID, thisMesmerOrder);
                                mesmerSorter.Add(thisMesmerOrder);
                            }
                        }
                        foreach (var foundMesmer in mesmersByDescription) {
                            if (mesmerTally.ContainsKey(foundMesmer.ID)) {
                                mesmerTally[foundMesmer.ID].SortTally = mesmerTally[foundMesmer.ID].SortTally + 1;
                                if (!currentPassIDs.Contains(foundMesmer.ID)) {
                                    currentPassIDs.Add(foundMesmer.ID);
                                    mesmerTally[foundMesmer.ID].CaptureTally++;
                                }
                            } else {
                                var thisMesmerOrder = new MesmerOrderer { ToSort = foundMesmer, SortTally = 1.0, CaptureTally = 1 };
                                mesmerTally.Add(foundMesmer.ID, thisMesmerOrder);
                                mesmerSorter.Add(thisMesmerOrder);
                            }
                        }
                        foreach (var foundMesmer in mesmersByTags) {
                            if (mesmerTally.ContainsKey(foundMesmer.ID)) {
                                mesmerTally[foundMesmer.ID].SortTally = mesmerTally[foundMesmer.ID].SortTally + 1;
                                if (!currentPassIDs.Contains(foundMesmer.ID)) {
                                    currentPassIDs.Add(foundMesmer.ID);
                                    mesmerTally[foundMesmer.ID].CaptureTally++;
                                }
                            } else {
                                var thisMesmerOrder = new MesmerOrderer { ToSort = foundMesmer, SortTally = (1.0 / _context.MesmerTags.Where(mt => mt.MesmerID == foundMesmer.ID).Count()), CaptureTally = 1 };
                                mesmerTally.Add(foundMesmer.ID, thisMesmerOrder);
                                mesmerSorter.Add(thisMesmerOrder);
                            }
                        }
                    }
                }
            } else {
                foreach (var mesmer in _context.Mesmers) {
                    var thisMesmerOrder = new MesmerOrderer { ToSort = mesmer, SortTally = 1.0 };
                    mesmerSorter.Add(thisMesmerOrder);
                }
            }
            mesmerSorter = mesmerSorter.Where(m=>m.CaptureTally == capturesRequired).ToList();
            mesmerSorter.Sort((ms1, ms2) => ms1.SortTally.CompareTo(ms2.SortTally));
            foreach(var sortedMesmer in mesmerSorter) {
                returnedMesmers.Add(sortedMesmer.ToSort);
            }
            return returnedMesmers;
        }
    }
}
