import { config } from '../config/index.js';

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns token (base64 of "username:password") for subsequent API calls.
 */
export function login(req, res) {
  const { username, password } = req.body || {};
  if (username === config.admin.username && password === config.admin.password) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return res.status(200).json({
      success: true,
      token,
      user: { username: config.admin.username },
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
