using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Data
{
    public class MesmerTag
    {
        public String MesmerID { get; set; }
        public String Tag { get; set; }
        public virtual Mesmer Mesmer { get; set; }
    }
}
