import crypto from 'crypto';

const API_KEY_LENGTH = 256;
const SALT_ENV = process.env.API_KEY_SALT || 'lms-default-salt-change-in-production';

/**
 * Generates a 256-character unique API key using crypto.
 * Algorithm: HMAC-SHA256 of random bytes with timestamp and salt, then extended to 256 chars.
 */
export function generateApiKey() {
  const randomPart = crypto.randomBytes(128).toString('hex');
  const timePart = Date.now().toString(36) + process.hrtime.bigint().toString(36);
  const hmac = crypto.createHmac('sha256', SALT_ENV);
  hmac.update(randomPart + timePart + crypto.randomBytes(16).toString('hex'));
  const hash = hmac.digest('hex');
  const combined = randomPart + hash + timePart;
  const key = combined.length >= API_KEY_LENGTH
    ? combined.slice(0, API_KEY_LENGTH)
    : combined + crypto.randomBytes(Math.ceil((API_KEY_LENGTH - combined.length) / 2)).toString('hex').slice(0, API_KEY_LENGTH - combined.length);
  return key.slice(0, API_KEY_LENGTH);
}
