import { Subscription } from '../models/Subscription.js';
import { SubscriptionPlanAssignment } from '../models/SubscriptionPlanAssignment.js';
import { Module } from '../models/Module.js';
import { BillingPlan } from '../models/BillingPlan.js';
import { toResponse, toResponseList } from '../utils/serialize.js';
import mongoose from 'mongoose';

const SUBSCRIPTION_TYPES = ['Individual', 'Hybrid', 'Institute/School'];

export async function list(req, res) {
  try {
    const { type } = req.query;
    const filter = type && SUBSCRIPTION_TYPES.includes(type) ? { type } : {};
    const list = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    const subIdsWithPlan = await SubscriptionPlanAssignment.distinct('subscriptionId');
    const hasPlanSet = new Set(subIdsWithPlan.map((id) => id.toString()));
    const out = list.map((doc) => {
      const item = toResponse(doc);
      item.password = doc.password;
      item.hasPlanAssignment = hasPlanSet.has(doc._id.toString());
      return item;
    });
    return res.json(out);
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
    const out = toResponse(doc);
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

/**
 * GET /api/subscriptions/:id/details
 * Returns subscription with password, masters enrolled (from assigned plan(s)), plan assignments (with duration/endDate), and apiKey.
 */
export async function getDetails(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const subId = new mongoose.Types.ObjectId(id);
    const subscription = await Subscription.findById(subId).lean();
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const planAssignments = await SubscriptionPlanAssignment.find({ subscriptionId: subId })
      .sort({ startDate: -1 })
      .lean();

    const planIds = [...new Set((planAssignments || []).map((a) => a.planId))];
    const plans = planIds.length > 0 ? await BillingPlan.find({ _id: { $in: planIds } }).lean() : [];

    const planMap = Object.fromEntries(plans.map((p) => [p._id.toString(), p]));

    // Masters enrolled = masters from the assigned plan(s)
    const masterIdsFromPlans = [...new Set(plans.flatMap((p) => (p.masterIds || []).map((id) => id.toString())))];
    const masterObjectIds = masterIdsFromPlans
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const modules = masterObjectIds.length > 0 ? await Module.find({ _id: { $in: masterObjectIds } }).lean() : [];
    const moduleMap = Object.fromEntries(modules.map((m) => [m._id.toString(), m]));
    const orderedModules = masterIdsFromPlans.map((mid) => moduleMap[mid]).filter(Boolean);
    const now = new Date();
    const planAssignmentsWithDetails = (planAssignments || []).map((a) => {
      const plan = planMap[a.planId.toString()];
      const endDate = a.endDate ? new Date(a.endDate) : null;
      const isActive = endDate && endDate >= now;
      return {
        id: a._id.toString(),
        planId: a.planId.toString(),
        planName: plan?.name ?? '',
        startDate: a.startDate,
        endDate: a.endDate,
        duration: a.duration,
        isActive: !!isActive,
        cost: plan?.cost,
        addons: plan?.addons || [],
      };
    });

    const subResponse = toResponse(subscription);
    if (subscription.apiKey) subResponse.apiKey = subscription.apiKey;

    return res.json({
      subscription: subResponse,
      assignedModules: orderedModules.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        description: m.description,
      })),
      planAssignments: planAssignmentsWithDetails,
    });
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
