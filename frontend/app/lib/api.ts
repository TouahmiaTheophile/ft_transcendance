

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!API_BASE) {
    return cleanPath;
  }

  return `${API_BASE}${cleanPath}`;
}

export type ApiErrorResponse = {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: any;
  timestamp?: string;
  path?: string;
};

export async function readApiError(res: Response): Promise<ApiErrorResponse> {
  try {
    return await res.json();
  } catch {
    return {
      statusCode: res.status,
      code: "REQUEST_FAILED",
      message: `Request failed with status ${res.status}`,
      details: null,
    };
  }
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;

  refreshing = fetch(apiUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });

  if (res.status !== 401) return res;

  const refreshed = await tryRefresh();

  if (!refreshed) {
    window.location.href = "/login";
    return res;
  }

  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}