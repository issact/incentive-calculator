const BACKEND_API_URL =
  "https://incentive-calculator-backend.vercel.app/api/v1"

const PRODUCTION_FRONTEND_API_URL =
  "https://incentive-calculator-frontend.vercel.app/api/v1"

/** Client-side / public API base (browser fetch). */
export function getPublicApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  if (process.env.NODE_ENV === "production") {
    return "/api/v1"
  }
  return "http://localhost:5000/api/v1"
}

/** Server-side API base (RSC, route handlers). */
export function getServerApiUrl(): string {
  if (process.env.API_URL) {
    return process.env.API_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/v1`
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_FRONTEND_API_URL
  }
  return "http://localhost:5000/api/v1"
}

/** Upstream backend for the BFF proxy. */
export function getBackendApiUrl(): string {
  return BACKEND_API_URL
}
