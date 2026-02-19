/**
 * In-memory rate limiter for login. Limits requests per IP per window.
 * For production at scale, use Redis-backed rate limiting.
 */
const store = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

export function loginRateLimit(req, res, next) {
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = store.get(key);
  if (!entry) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' });
  }
  next();
}
