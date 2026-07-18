import localFont from "next/font/local";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
