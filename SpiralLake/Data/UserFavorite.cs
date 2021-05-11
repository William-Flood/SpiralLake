using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Data
{
    public class UserFavorite
    {
        public String UserID { get; set; }
        public String MesmerID { get; set; }
        public virtual Mesmer Mesmer { get; set; }
    }
}
