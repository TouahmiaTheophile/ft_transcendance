"use client";

// ============================================================================
// -rbauerMod3- Site-wide footer with the two legal links required by the
// subject (Privacy Policy, Terms of Service).
//
// Like LanguageSwitcher, rendered once in app/layout.tsx and positioned
// `fixed`, so the links work on every page, login and register included, with
// no change to existing pages.
//
// A Client Component only because useTranslation() reads React Context.
// ============================================================================

import Link from "next/link";
import { useTranslation } from "@/app/lib/i18n/useTranslation";

export default function Footer() {
  const { t } = useTranslation();

  return (
    // -rbauerMod3- `fixed bottom-0 left-0 right-0` pins the bar to the viewport:
    // every page sets `min-h-screen`, so a footer in normal flow would always
    // sit below the fold, while the subject requires the legal pages to be
    // easily accessible.
    //
    // z-50 matches LanguageSwitcher, keeping the bar above page content, and
    // bg-black/40 + backdrop-blur keeps the background visible under readable
    // text.
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur">
      {/*
        -rbauerMod3-
        A <nav>, not a <div>: screen readers then list it among the page
        landmarks. `aria-label` names it so it is distinguishable from the main
        navigation, and the label is translated like the rest.
      */}
      <nav
        aria-label={t("footer.nav")}
        className="flex items-center justify-center gap-3 py-2 text-xs text-white/60"
      >
        {/*
          -rbauerMod3-
          next/link, not a raw <a>: client-side navigation avoids a full reload,
          which would rebuild the React tree and flash the language back to "en"
          until LanguageContext re-reads localStorage.
        */}
        <Link href="/privacy" className="hover:text-white focus-visible:text-white">
          {t("footer.privacy")}
        </Link>

        {/* -rbauerMod3- Decorative separator, hidden from screen readers, which
            would otherwise announce "middle dot" between the links. */}
        <span aria-hidden="true">·</span>

        <Link href="/terms" className="hover:text-white focus-visible:text-white">
          {t("footer.terms")}
        </Link>
      </nav>
    </footer>
  );
}
