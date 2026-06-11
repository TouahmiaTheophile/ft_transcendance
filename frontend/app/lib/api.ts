const API = "http://localhost:3000"

let refreshing: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing

  refreshing = fetch(`${API}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(res => res.ok)
    .catch(() => false)
    .finally(() => { refreshing = null })

  return refreshing
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API}${path}`, { ...init, credentials: "include" })

  if (res.status !== 401) return res

  const refreshed = await tryRefresh()
  if (!refreshed) {
    window.location.href = "/login"
    return res
  }

  return fetch(`${API}${path}`, { ...init, credentials: "include" })
}

export { API }
