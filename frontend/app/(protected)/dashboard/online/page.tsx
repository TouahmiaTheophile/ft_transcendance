"use client"

import React from 'react'
import LobbyList from './components/LobbyList'
import Link from 'next/link'
import { useTranslation } from '@/app/lib/i18n/useTranslation'

const page = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4 pb-12">
      <Link
          href="/dashboard"
          aria-label={t("common.backToDashboardAria")}
          className="self-start flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit"
        >
          <span className="text-lg leading-none">←</span>
          {t("common.backToDashboard")}
        </Link>
      <h1 className="text-2xl font-bold text-white mb-6">{t("online.title")}</h1>
      <LobbyList />
    </div>
  )
}

export default page