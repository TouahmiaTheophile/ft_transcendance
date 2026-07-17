"use client"

import { apiFetch } from "@/app/lib/api"

const LogoutButton = () => {
  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <button
      onClick={logout}
      className="self-end flex items-center gap-2 text-sm text-blue-200/70 hover:text-blue-200 w-fit cursor-pointer"
    >
      Logout
      <span className="text-lg leading-none">→</span>
    </button>
  )
}

export default LogoutButton
