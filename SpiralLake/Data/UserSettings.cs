using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Data
{
    public enum RingStyle
    {
        Circle, Oval
    }
    public class UserSettings
    {
        public String UserID { get; set; }
        public String SettingName { get; set; }
        public Decimal XRight { get; set; }
        public Decimal xRightBottom { get; set; }
        public Decimal xRightTop { get; set; }
        public Decimal yRightBottom { get; set; }
        public Decimal yRightTop { get; set; }
        public Decimal xLeft { get; set; }
        public Decimal xLeftBottom { get; set; }
        public Decimal xLeftTop { get; set; }
        public Decimal yLeftBottom { get; set; }
        public Decimal yLeftTop { get; set; }
        public int NumberOfCurves { get; set; }
        public Decimal SpiralSpeed { get; set; }
        public Decimal SpiralSeparation { get; set; }
        public int NumberOfRings { get; set; }
        public Decimal RingSpeed { get; set; }
        public RingStyle RingStyle { get; set; }
        public Decimal TextSpeed { get; set; }
        public String FontFamily  { get; set; }
        public int FontSize { get; set; }

    }
}
