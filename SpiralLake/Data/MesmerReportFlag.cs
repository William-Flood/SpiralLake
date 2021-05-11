using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Data
{
    public class MesmerReportFlag
    {
        DateTime CreatedOn { get; set; }
        public String MesmerID { get; set; }
        public String Reason { get; set; }
        public String CreatorID { get; set; }
        public virtual Mesmer Mesmer { get; set; }
        [ForeignKey("CreatorID")]
        public virtual SpiralLake.Areas.Identity.Data.SpiralLakeUser Creator { get; set; }
    }
}
