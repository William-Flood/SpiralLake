using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SpiralLake.Models;
using SpiralLake.Services;
using Microsoft.AspNetCore.Http;
using JavaScriptEngineSwitcher.V8;
using JavaScriptEngineSwitcher.Extensions.MsDependencyInjection;
using React.AspNet;
using System.Net;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace SpiralLake
{
    public class Startup
    {
        public Startup(IConfiguration configuration) {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services) {
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddReact();

            // Make sure a JS engine is registered, or you will get an error!
            services.AddJsEngineSwitcher(options => options.DefaultEngineName = V8JsEngine.EngineName)
              .AddV8();
            services.AddControllersWithViews();
            SpiralLake.Controllers.WelcomeController.AdminName = Configuration.GetValue<String>("AdminName");
            services.Configure<IdentityOptions>(options => {
                options.Password.RequireNonAlphanumeric = false;
            });

            services.AddTransient<IEmailSender, EmailSender>();
            services.Configure<AuthMessageSenderOptions>(Configuration);
            services.AddRazorPages();
            services.AddDistributedMemoryCache();

            services.AddSession(options => {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            });
            services.AddAuthorization(options => {
                options.AddPolicy("HasAuthentication", policy => policy.RequireClaim("Authenticated"));
                options.AddPolicy("Registered", policy => policy.RequireClaim("UserId"));
            });
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options => {
                options.LoginPath = "/Welcome/Index";
                options.AccessDeniedPath = "/Welcome/Index";
                options.LogoutPath = "/Account/LogOff";
                options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
            });
            services.ConfigureApplicationCookie(options =>
                {
                    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
                }
            );
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            } else {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseReact(config => {
                config.AddScript("~/js/MesmerList.jsx");
            });
            app.UseStaticFiles();

            app.UseRouting();
            var cookiePolicyOptions = new CookiePolicyOptions {
                MinimumSameSitePolicy = SameSiteMode.Strict,
            };
            app.UseCookiePolicy(cookiePolicyOptions);

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseSession();

            app.UseMiddleware<SpiralLake.Controllers.SessionCheckMiddleware>();

            app.UseEndpoints(endpoints => {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });
        }
    }
}
