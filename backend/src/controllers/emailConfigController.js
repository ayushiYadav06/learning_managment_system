import { EmailConfig } from '../models/EmailConfig.js';
import { encrypt, decrypt } from '../utils/encrypt.js';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

function createTransporter(host, port, user, pass) {
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * GET /api/subscriptions/:subscriptionId/email-config
 * Returns saved config for this subscription (no password).
 */
export async function getBySubscriptionId(req, res) {
  try {
    const { subscriptionId } = req.params;
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const subId = new mongoose.Types.ObjectId(subscriptionId);
    const doc = await EmailConfig.findOne({ subscriptionId: subId }).lean();
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
 * PUT /api/subscriptions/:subscriptionId/email-config
 * Body: { smtpHost, port, email, appPassword }
 */
export async function updateBySubscriptionId(req, res) {
  try {
    const { subscriptionId } = req.params;
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const { smtpHost, port, email, appPassword } = req.body || {};

    if (!smtpHost || typeof smtpHost !== 'string' || !smtpHost.trim()) {
      return res.status(400).json({ success: false, message: 'SMTP Host is required' });
    }
    const portNum = parseInt(port, 10);
    if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return res.status(400).json({ success: false, message: 'Valid port (1-65535) is required' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email ID is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!appPassword || typeof appPassword !== 'string' || !appPassword.trim()) {
      return res.status(400).json({ success: false, message: 'App Password is required' });
    }

    const subId = new mongoose.Types.ObjectId(subscriptionId);
    const encryptedPassword = encrypt(appPassword.trim());

    const doc = await EmailConfig.findOneAndUpdate(
      { subscriptionId: subId },
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
 * POST /api/subscriptions/:subscriptionId/email-config/test
 * Body: { to: "recipient@example.com" }
 */
export async function sendTestBySubscriptionId(req, res) {
  try {
    const { subscriptionId } = req.params;
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const { to } = req.body || {};
    if (!to || typeof to !== 'string' || !to.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid recipient email format' });
    }

    const subId = new mongoose.Types.ObjectId(subscriptionId);
    const doc = await EmailConfig.findOne({ subscriptionId: subId }).lean();
    if (!doc || !doc.encryptedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration not found. Please save configuration first.',
      });
    }

    const password = decrypt(doc.encryptedPassword);
    const transporter = createTransporter(
      doc.smtpHost,
      doc.port,
      doc.email,
      password
    );

    await transporter.sendMail({
      from: doc.email,
      to: to.trim(),
      subject: 'LMS Admin – Test Email',
      text: 'This is a test email from the LMS Admin email configuration.',
      html: '<p>This is a test email from the <strong>LMS Admin</strong> email configuration.</p>',
    });

    return res.json({ success: true, message: 'Test email sent successfully' });
  } catch (err) {
    let message = err.message || 'Failed to send test email';
    if (err.responseCode === 535 || (typeof message === 'string' && message.includes('535'))) {
      message =
        'SMTP login failed (Username and Password not accepted). For Gmail: use your full email and an App Password (not your normal password). Enable 2-Step Verification, then create an App Password at https://myaccount.google.com/apppasswords';
    }
    return res.status(500).json({ success: false, message });
  }
}
