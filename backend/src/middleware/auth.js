import { config } from '../config/index.js';

/**
 * Simple super-admin auth: expect body or header with valid admin credentials.
 * For session-based auth we could use a token; here we accept username/password per request
 * or a simple Bearer token that matches admin credentials (for API calls from frontend).
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const username = req.body?.username ?? req.headers['x-username'];
  const password = req.body?.password ?? req.headers['x-password'];

  let valid = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // Simple token: base64(admin:admin123) or just "admin:admin123"
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [u, p] = decoded.split(':');
      if (u === config.admin.username && p === config.admin.password) valid = true;
    } catch (_) {}
    if (!valid && token === `${config.admin.username}:${config.admin.password}`) valid = true;
  }
  if (!valid && username === config.admin.username && password === config.admin.password) {
    valid = true;
  }

  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid or missing credentials' });
  }
  next();
}
