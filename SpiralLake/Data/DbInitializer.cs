using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Data
{
    public class DbInitializer
    {
        public static void Initialize(SpiralLakeContext context) {
            context.Database.EnsureCreated();

        }
    }
}
