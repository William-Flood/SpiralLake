using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Data
{
    public class MesmerText
    {

        public String MesmerID { get; set; }
        public String UserID { get; set; }
        public int LineID { get; set; }
        public String Text { get; set; }
        public virtual Mesmer Mesmer { get; set; }
    }
}
