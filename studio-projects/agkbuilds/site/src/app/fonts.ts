import localFont from "next/font/local";

// type.md "Delivery": four static subset instances (scripts/subset-fonts.mjs), all preloaded
// because all four are above the fold at 375 and 1280 (headline, subhead, button, mono labels).
export const archivoWide = localFont({
  src: "./fonts/archivo-wide-800.woff2",
  weight: "800",
  style: "normal",
  variable: "--font-archivo-wide",
  display: "swap",
  preload: true,
});

export const archivo = localFont({
  src: [
    { path: "./fonts/archivo-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/archivo-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
});

export const mono = localFont({
  src: "./fonts/jetbrains-mono-500.woff2",
  weight: "500",
  style: "normal",
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
});
