import { BillingPlan } from '../models/BillingPlan.js';
import { BillingSubscription } from '../models/BillingSubscription.js';
import { SubscriptionActivityLog } from '../models/SubscriptionActivityLog.js';
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
    const { name, masterIds, users, afterExceedLimitPerUser, cost, planCost, addons } = req.body || {};
    if (name == null || cost == null) {
      return res.status(400).json({ success: false, message: 'Missing name or cost' });
    }
    const masterIdsArr = Array.isArray(masterIds)
      ? masterIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];
    const addonsArr = Array.isArray(addons)
      ? addons.map((a) => ({ name: a.name || '', cost: Number(a.cost) || 0 }))
      : [];
    const doc = await BillingPlan.create({
      name,
      masterIds: masterIdsArr,
      users: users != null ? Number(users) : 500,
      afterExceedLimitPerUser: afterExceedLimitPerUser != null ? Number(afterExceedLimitPerUser) : 0,
      cost: Number(cost),
      planCost: planCost != null ? Number(planCost) : 0,
      addons: addonsArr,
    });
    await SubscriptionActivityLog.create({
      action: 'plan_created',
      planId: doc._id,
      planName: doc.name ?? '',
      details: 'Plan created',
    });
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
    const { name, masterIds, users, afterExceedLimitPerUser, cost, planCost, addons } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const update = {};
    if (name != null) update.name = name;
    if (Array.isArray(masterIds)) {
      update.masterIds = masterIds.filter((mid) => mongoose.Types.ObjectId.isValid(mid));
    }
    if (users != null) update.users = Number(users);
    if (afterExceedLimitPerUser != null) update.afterExceedLimitPerUser = Number(afterExceedLimitPerUser);
    if (cost != null) update.cost = Number(cost);
    if (planCost != null) update.planCost = Number(planCost);
    if (Array.isArray(addons)) {
      update.addons = addons.map((a) => ({ name: a.name || '', cost: Number(a.cost) || 0 }));
    }
    const doc = await BillingPlan.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Billing plan not found' });
    await SubscriptionActivityLog.create({
      action: 'plan_updated',
      planId: doc._id,
      planName: doc.name ?? '',
      details: 'Plan details updated (name, masters, users, cost, or other fields)',
    });
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
    const doc = await BillingPlan.findById(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Billing plan not found' });
    await BillingPlan.findByIdAndDelete(id);
    await SubscriptionActivityLog.create({
      action: 'plan_deleted',
      planId: doc._id,
      planName: doc.name ?? '',
      details: 'Plan deleted',
    });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

