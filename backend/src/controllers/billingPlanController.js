import { BillingPlan } from '../models/BillingPlan.js';
import { BillingSubscription } from '../models/BillingSubscription.js';
import { toResponse, toResponseList } from '../utils/serialize.js';
import mongoose from 'mongoose';

export async function list(req, res) {
  try {
    const list = await BillingPlan.find().sort({ createdAt: -1 }).lean();
    const planIds = list.map((p) => p._id);
    const counts = await BillingSubscription.aggregate([
      { $match: { planId: { $in: planIds } } },
      { $project: { planId: 1, count: { $size: '$subscriptionIds' } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c.planId.toString(), c.count]));
    const withCount = list.map((p) => ({
      ...p,
      subscriptionCount: countMap[p._id.toString()] ?? 0,
    }));
    return res.json(toResponseList(withCount));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function create(req, res) {
  try {
    const { name, cost, addons } = req.body || {};
    if (name == null || cost == null) {
      return res.status(400).json({ success: false, message: 'Missing name or cost' });
    }
    const addonsArr = Array.isArray(addons)
      ? addons.map((a) => ({ name: a.name || '', cost: Number(a.cost) || 0 }))
      : [];
    const doc = await BillingPlan.create({ name, cost: Number(cost), addons: addonsArr });
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
    const doc = await BillingPlan.findById(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Billing plan not found' });
    return res.json(toResponse(doc));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, cost, addons } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const update = {};
    if (name != null) update.name = name;
    if (cost != null) update.cost = Number(cost);
    if (Array.isArray(addons)) {
      update.addons = addons.map((a) => ({ name: a.name || '', cost: Number(a.cost) || 0 }));
    }
    const doc = await BillingPlan.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Billing plan not found' });
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
    const doc = await BillingPlan.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Billing plan not found' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/billing-plans/:planId/subscription-count
 * Returns count of subscriptions assigned to this plan (for list view).
 */
export async function getSubscriptionCount(req, res) {
  try {
    const { planId } = req.params;
    if (!mongoose.isValidObjectId(planId)) {
      return res.status(400).json({ success: false, message: 'Invalid plan ID' });
    }
    const doc = await BillingSubscription.findOne({ planId: new mongoose.Types.ObjectId(planId) }).lean();
    const count = doc?.subscriptionIds?.length ?? 0;
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
