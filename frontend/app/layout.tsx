import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
// -rbauerMod3- Site-wide footer holding the Privacy Policy / Terms links.
import Footer from "./components/Footer";

// Self-hosted fonts: files live in ./fonts and are read at build time, so the
// build never needs to reach fonts.googleapis.com. Geist, Geist Mono and
// Orbitron are variable fonts (one file covers the whole weight range).
const geistSans = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const rajdhani = localFont({
  src: "./fonts/Rajdhani-700.woff2",
  variable: "--font-rajdhani",
  weight: "700",
  display: "swap",
});

const orbitron = localFont({
  src: "./fonts/Orbitron.woff2",
  variable: "--font-orbitron",
  weight: "400 900",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="synthwave"
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          -rbauer-
          LanguageProvider exposes the current language to every page
          (LanguageContext.tsx). It is a Client Component wrapping `children`,
          so the rest of the app, Server Components included, is unaffected:
          only the translation system runs on the client. LanguageSwitcher sits
          here once so the picker appears on every page.
        */}
        <LanguageProvider>
          <LanguageSwitcher />
          {children}
          {/*
            -rbauerMod3-
            Mounted once here for the same reason as LanguageSwitcher: RootLayout
            wraps every route, so the legal links appear everywhere without
            editing any page.

            Placement matters twice:

            1. INSIDE <LanguageProvider>: Footer calls useTranslation(), which
               throws outside the provider.

            2. AFTER {children}: the CSS decides the visual position, but the DOM
               order decides the tab order, so the legal links come last.
          */}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
