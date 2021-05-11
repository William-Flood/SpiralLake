using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Models
{
    public class MesmerAndText
    {
        public SpiralLake.Data.Mesmer Mesmer { get; set; }
        public String MesmerText { get; set; }
        public String Notification { get; set;}
        public String ButtonLabel { get; set; }
        public String Tags { get; set; }
    }
}
