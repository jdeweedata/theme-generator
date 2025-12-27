import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Theme Generator | Create Beautiful Color Themes",
  description: "Generate and customize beautiful color themes for your web projects. Export CSS variables for easy integration with Tailwind CSS and shadcn/ui.",
};

// Google Fonts to preload
const googleFonts = [
  "Inter:wght@400;500;600;700",
  "Geist:wght@400;500;600;700",
  "Plus+Jakarta+Sans:wght@400;500;600;700",
  "DM+Sans:wght@400;500;600;700",
  "Outfit:wght@400;500;600;700",
  "Space+Grotesk:wght@400;500;600;700",
  "Sora:wght@400;500;600;700",
  "Manrope:wght@400;500;600;700",
  "Rubik:wght@400;500;600;700",
  "Work+Sans:wght@400;500;600;700",
  "Nunito+Sans:wght@400;500;600;700",
  "Public+Sans:wght@400;500;600;700",
  "Open+Sans:wght@400;500;600;700",
  "Roboto:wght@400;500;600;700",
  "Lato:wght@400;700",
  "Montserrat:wght@400;500;600;700",
  "Poppins:wght@400;500;600;700",
  "Raleway:wght@400;500;600;700",
  "Source+Sans+3:wght@400;500;600;700",
  "Ubuntu:wght@400;500;700",
  "Source+Serif+4:wght@400;500;600;700",
  "Merriweather:wght@400;700",
  "Playfair+Display:wght@400;500;600;700",
  "Lora:wght@400;500;600;700",
  "Crimson+Pro:wght@400;500;600;700",
  "Libre+Baskerville:wght@400;700",
  "EB+Garamond:wght@400;500;600;700",
  "Cormorant+Garamond:wght@400;500;600;700",
  "Spectral:wght@400;500;600;700",
  "Bitter:wght@400;500;600;700",
  "Noto+Serif:wght@400;500;600;700",
  "PT+Serif:wght@400;700",
  "Roboto+Slab:wght@400;500;600;700",
  "JetBrains+Mono:wght@400;500;600;700",
  "Fira+Code:wght@400;500;600;700",
  "Source+Code+Pro:wght@400;500;600;700",
  "IBM+Plex+Mono:wght@400;500;600;700",
  "Roboto+Mono:wght@400;500;600;700",
  "Ubuntu+Mono:wght@400;700",
  "Space+Mono:wght@400;700",
  "Inconsolata:wght@400;500;600;700",
].join("&family=");

const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${googleFonts}&display=swap`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
