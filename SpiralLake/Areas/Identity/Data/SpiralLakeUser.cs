using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace SpiralLake.Areas.Identity.Data
{
    // Add profile data for application users by adding properties to the SpiralLakeUser class
    public class SpiralLakeUser : IdentityUser
    {
        String TOSAgree { get; set; }
        DateTime RegisteredOn { get; set; }
        public Boolean IsPublic { get; set; }
    }
}
