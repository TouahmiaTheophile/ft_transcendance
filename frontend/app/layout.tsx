import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";

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
          LanguageProvider makes the current language available to every
          page (see app/lib/i18n/LanguageContext.tsx). It's a Client
          Component wrapping `children`, which lets the rest of the app
          (including plain Server Components) keep working exactly as
          before -- only the translation system itself runs on the client.
          LanguageSwitcher is placed here, once, so the picker shows up on
          literally every page instead of being added to each one.
        */}
        <LanguageProvider>
          <LanguageSwitcher />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
