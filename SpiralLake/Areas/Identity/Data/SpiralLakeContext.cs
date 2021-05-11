using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SpiralLake.Areas.Identity.Data;

namespace SpiralLake.Data
{
    public class SpiralLakeContext : IdentityDbContext<SpiralLakeUser>
    {
        public SpiralLakeContext(DbContextOptions<SpiralLakeContext> options)
            : base(options)
        {
        }

        public DbSet<Mesmer> Mesmers { get; set; }
        public DbSet<MesmerText> MesmerTexts { get; set; }
        public DbSet<MesmerTag> MesmerTags { get; set; }
        public DbSet<UserFavorite> UserFavorites { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }
        public DbSet<MesmerReportFlag> MesmerReportFlags { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<MesmerText>().HasKey(mc => new { mc.MesmerID, mc.UserID, mc.LineID });
            builder.Entity<UserFavorite>().HasKey(uf => new { uf.UserID, uf.MesmerID });
            builder.Entity<MesmerTag>().HasKey(mf => new { mf.Tag, mf.MesmerID });
            builder.Entity<UserSettings>().HasKey(us => new { us.UserID, us.SettingName });
            builder.Entity<MesmerReportFlag>().HasKey(mrf => new { mrf.CreatorID, mrf.MesmerID });
            base.OnModelCreating(builder);
            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);
        }
    }
}
