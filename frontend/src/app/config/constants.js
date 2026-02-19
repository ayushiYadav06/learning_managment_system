export const API_BASE_URL =
  (import.meta.env?.VITE_API_URL) ?? 'http://localhost:4000';

/** Get user-facing message from RTK Query / API error (status 429, 400, etc.). */
export function getApiErrorMessage(err, fallback = 'Something went wrong') {
  return err?.data?.message ?? err?.message ?? fallback;
}
