using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SpiralLake.Areas.Identity.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace SpiralLake.Controllers
{
    public class SessionCheckMiddleware
    {
        private readonly RequestDelegate _next;
        public SessionCheckMiddleware(RequestDelegate next) {
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext, UserManager<SpiralLakeUser> userManager, IOptions<IdentityOptions> optionsAccessor) {
            var user = await userManager.GetUserAsync(httpContext.User);
            if (httpContext.Session.Keys.Contains("Authenticated")) {
                ((ClaimsIdentity)(httpContext.User.Identity)).AddClaim(new Claim("Authenticated", httpContext.Session.GetString("Authenticated")));
            } else if (null != user) {
                if("Admin".Equals(user.UserName)) {
                    ((ClaimsIdentity)(httpContext.User.Identity)).AddClaim(new Claim("Authenticated", "Admin"));
                } else {
                    ((ClaimsIdentity)(httpContext.User.Identity)).AddClaim(new Claim("Authenticated", "User"));
                }
            }
            await _next(httpContext);
        }
    }
}
