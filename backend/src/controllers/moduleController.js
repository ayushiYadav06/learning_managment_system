import { Module } from '../models/Module.js';
import { toResponse, toResponseList } from '../utils/serialize.js';
import mongoose from 'mongoose';

export async function list(req, res) {
  try {
    const list = await Module.find().sort({ createdAt: -1 }).lean();
    return res.json(toResponseList(list));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function create(req, res) {
  try {
    const { name, description } = req.body || {};
    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Missing name or description' });
    }
    const doc = await Module.create({ name, description });
    return res.status(201).json(toResponse(doc));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const doc = await Module.findById(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Module not found' });
    return res.json(toResponse(doc));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const doc = await Module.findByIdAndUpdate(
      id,
      { $set: { name, description } },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Module not found' });
    return res.json(toResponse(doc));
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
    const doc = await Module.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Module not found' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
