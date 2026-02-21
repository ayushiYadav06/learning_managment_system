import { AdminEmailConfig } from '../models/AdminEmailConfig.js';
import { encrypt, decrypt } from '../utils/encrypt.js';
import nodemailer from 'nodemailer';

function createTransporter(host, port, user, pass) {
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * GET /api/admin/email-config
 * Returns admin email config (no password).
 */
export async function getConfig(req, res) {
  try {
    const doc = await AdminEmailConfig.findOne().lean();
    if (!doc) {
      return res.json({
        configured: false,
        smtpHost: '',
        port: 587,
        email: '',
      });
    }
    return res.json({
      configured: true,
      id: doc._id.toString(),
      smtpHost: doc.smtpHost || '',
      port: doc.port ?? 587,
      email: doc.email || '',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/admin/email-config
 * Body: { smtpHost, port, email, appPassword }
 */
export async function updateConfig(req, res) {
  try {
    const { smtpHost, port, email, appPassword } = req.body || {};

    if (!smtpHost || typeof smtpHost !== 'string' || !smtpHost.trim()) {
      return res.status(400).json({ success: false, message: 'SMTP Host is required' });
    }
    const portNum = parseInt(port, 10);
    if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return res.status(400).json({ success: false, message: 'Valid port (1-65535) is required' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!appPassword || typeof appPassword !== 'string' || !appPassword.trim()) {
      return res.status(400).json({ success: false, message: 'App Password is required' });
    }

    const encryptedPassword = encrypt(appPassword.trim());

    const doc = await AdminEmailConfig.findOneAndUpdate(
      {},
      {
        $set: {
          smtpHost: smtpHost.trim(),
          port: portNum,
          email: email.trim().toLowerCase(),
          encryptedPassword,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return res.json({
      success: true,
      id: doc._id.toString(),
      smtpHost: doc.smtpHost,
      port: doc.port,
      email: doc.email,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Send email using admin config. Returns true if sent, false if no config.
 * Used by subscription create and reset password.
 */
export async function sendAdminEmail(to, subject, text, html) {
  const doc = await AdminEmailConfig.findOne().lean();
  if (!doc || !doc.encryptedPassword) return false;
  const password = decrypt(doc.encryptedPassword);
  const transporter = createTransporter(doc.smtpHost, doc.port, doc.email, password);
  await transporter.sendMail({
    from: doc.email,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  });
  return true;
}
