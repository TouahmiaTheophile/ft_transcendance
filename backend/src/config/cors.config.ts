/**
 * Adaptive CORS.
 *
 * The hardcoded origin list only covered localhost and 127.0.0.1. Any machine
 * reaching the app through its LAN address got responses with no
 * Access-Control-Allow-Origin header, which the browser then discarded — the
 * server returned 200, so nothing showed up in the backend logs.
 *
 * Rule: accept any host as long as the port belongs to the project (frontend,
 * backend, or 80/443 via nginx). Covers localhost, 127.0.0.1, c1r6p1,
 * 10.11.x.x ... with no editing. `CORS_ORIGINS` adds exact origins if needed.
 */

type CorsCallback = (err: Error | null, allow?: boolean) => void;

const FRONTEND_PORT = process.env.FRONTEND_PORT ?? '3001';
const BACKEND_PORT = process.env.BACKEND_PORT ?? '3000';

const ALLOWED_PORTS = new Set([FRONTEND_PORT, BACKEND_PORT, '80', '443', '']);

const EXTRA_ORIGINS = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

export function corsOrigin(origin: string | undefined, callback: CorsCallback) {
  // curl / Postman / request same-origin : no header Origin
  if (!origin) return callback(null, true);

  if (EXTRA_ORIGINS.includes(origin.replace(/\/$/, ''))) {
    return callback(null, true);
  }

  try {
    // url.port value is '' when port is implicit (80  http, 443  https)
    if (ALLOWED_PORTS.has(new URL(origin).port)) return callback(null, true);
  } catch {
    /* malformed origin */
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`), false);
}

export const corsConfig = {
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

export const wsCorsConfig = {
  origin: corsOrigin,
  credentials: true,
};
