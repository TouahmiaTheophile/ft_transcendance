"use client";

import Link from "next/link";
import RegisterCard from "./components/RegisterCard";
import { useTranslation } from "@/app/lib/i18n/useTranslation";

const page = () => {
  const { t } = useTranslation();

  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-10 px-4">
      <Link
          href="/"
          aria-label={t("common.backToHomeAria")}
          className="self-start flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit"
        >
          <span className="text-lg leading-none">←</span>
          {t("common.backToHome")}
        </Link>
      <h1 className="title title-log">
        {t("register.heading")}
      </h1>
      <RegisterCard/>
    </main>

  )
}

export default page