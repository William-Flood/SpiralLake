using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SpiralLake.Areas.Identity
{
    public class MyUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<SpiralLake.Areas.Identity.Data.SpiralLakeUser>
    {
        public MyUserClaimsPrincipalFactory(
            UserManager<SpiralLake.Areas.Identity.Data.SpiralLakeUser> userManager,
            IOptions<IdentityOptions> optionsAccessor)
                : base(userManager, optionsAccessor) {
        }

        protected override async Task<ClaimsIdentity> GenerateClaimsAsync(SpiralLake.Areas.Identity.Data.SpiralLakeUser user) {
            var identity = await base.GenerateClaimsAsync(user);

            if ("Admin".Equals(user.UserName)) {
                identity.AddClaim(new Claim("Authenticated", "Admin"));
            } else if ("Guest".Equals(user.UserName)) {
                identity.AddClaim(new Claim("Authenticated", "Guest"));
            } else {
                identity.AddClaim(new Claim("Authenticated", "User"));
            }
            identity.AddClaim(new Claim("ContactName", user.UserName ?? "[Click to edit profile]"));
            return identity;
        }

        public async Task<ClaimsIdentity> GenerateID(SpiralLake.Areas.Identity.Data.SpiralLakeUser user) {
            return await base.GenerateClaimsAsync(user);
        }
    }
}
