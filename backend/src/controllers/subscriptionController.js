import { Subscription } from '../models/Subscription.js';
import { toResponse, toResponseList } from '../utils/serialize.js';
import mongoose from 'mongoose';

const SUBSCRIPTION_TYPES = ['Individual', 'Hybrid', 'Institute/School'];

export async function list(req, res) {
  try {
    const { type } = req.query;
    const filter = type && SUBSCRIPTION_TYPES.includes(type) ? { type } : {};
    const list = await Subscription.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(toResponseList(list, { exclude: ['password'] }));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function create(req, res) {
  try {
    const { fullName, email, mobile, type, username } = req.body || {};
    if (!fullName || !email || !mobile || !type || !username) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (!SUBSCRIPTION_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription type' });
    }
    const password = generatePassword();
    const doc = await Subscription.create({
      fullName,
      email,
      mobile,
      type,
      username,
      password,
    });
    const out = toResponse(doc, { exclude: ['password'] });
    return res.status(201).json(out);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const doc = await Subscription.findById(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Subscription not found' });
    return res.json(toResponse(doc, { exclude: ['password'] }));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const doc = await Subscription.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Subscription not found' });
    return res.json(toResponse(doc, { exclude: ['password'] }));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const doc = await Subscription.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Subscription not found' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
