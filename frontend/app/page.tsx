"use client";

import IdentificationCard from "./components/IdentificationCard";
import { useTranslation } from "./lib/i18n/useTranslation";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-20 px-4 md:px-0">
      <p className="subtitle-top">{t("home.welcome")}</p>
      <h1 className="title">
        GRID
        <span className="underscore">_</span>
        RUNNERS
      </h1>
      <div className="thin-line" aria-hidden="true" />
      <div className="mt-12">
        <IdentificationCard/>
      </div>
    </main>
  );
}
