using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpiralLake.Areas.Identity.Data;
using SpiralLake.Data;

[assembly: HostingStartup(typeof(SpiralLake.Areas.Identity.IdentityHostingStartup))]
namespace SpiralLake.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder) {
            builder.ConfigureServices((context, services) => {
                services.AddDbContext<SpiralLakeContext>(options =>
                    options.UseSqlServer(
                        context.Configuration.GetConnectionString("SpiralLakeContextConnection")));

                services.AddDefaultIdentity<SpiralLakeUser>(options => {
                    options.SignIn.RequireConfirmedAccount = true;
                })
                    .AddEntityFrameworkStores<SpiralLakeContext>().AddDefaultTokenProviders()
                    .AddClaimsPrincipalFactory<SpiralLake.Areas.Identity.MyUserClaimsPrincipalFactory>();
            });
        }
    }
}