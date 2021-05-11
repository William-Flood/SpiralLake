using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace SpiralLake.Data
{
    public class Mesmer {
        public String ID { get; set; }
        public String Name { get; set; }
        public String CreatorID { get; set; }
        public DateTime CreatedOn { get; set; }
        public int Views { get; set; }
        public String Description { get; set; }
        [ForeignKey("CreatorID")]
        public virtual SpiralLake.Areas.Identity.Data.SpiralLakeUser Creator { get; set; }
    }
}
