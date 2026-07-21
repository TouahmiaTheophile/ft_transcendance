"use client";

import { useTranslation } from "@/app/lib/i18n/useTranslation";

const page = () => {
  const { t } = useTranslation();

  return (
    <div>{t("game.placeholder")}</div>
  )
}

export default page
