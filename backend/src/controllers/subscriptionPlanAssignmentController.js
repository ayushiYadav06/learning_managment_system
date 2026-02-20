import { Subscription } from '../models/Subscription.js';
import { SubscriptionPlanAssignment } from '../models/SubscriptionPlanAssignment.js';
import { BillingSubscription } from '../models/BillingSubscription.js';
import { BillingPlan } from '../models/BillingPlan.js';
import { PlanAssignmentLog } from '../models/PlanAssignmentLog.js';
import { addDuration } from '../utils/duration.js';
import { generateApiKey } from '../utils/apiKey.js';
import mongoose from 'mongoose';

const DURATIONS = ['4-month', '8-month', '12-month', '2-year', '4-year'];

/**
 * GET /api/subscriptions/:subscriptionId/plan-assignments
 * Returns list of plan assignments for the subscription (with plan name, startDate, endDate, duration, isActive).
 */
export async function getPlanAssignments(req, res) {
  try {
    const { subscriptionId } = req.params;
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const subId = new mongoose.Types.ObjectId(subscriptionId);
    const assignments = await SubscriptionPlanAssignment.find({ subscriptionId: subId })
      .sort({ startDate: -1 })
      .lean();
    const planIds = [...new Set(assignments.map((a) => a.planId))];
    const plans = await BillingPlan.find({ _id: { $in: planIds } }).lean();
    const planMap = Object.fromEntries(plans.map((p) => [p._id.toString(), p]));
    const now = new Date();
    const list = assignments.map((a) => {
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
      };
    });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/subscriptions/:subscriptionId/plan-assignments
 * Body: { assignments: [{ planId, duration }] } or { planId, duration }
 * One plan per subscription. Replaces existing assignment. Start date = now. Generates/updates API key.
 */
export async function setPlanAssignments(req, res) {
  try {
    const { subscriptionId } = req.params;
    const { assignments, planId: singlePlanId, duration: singleDuration } = req.body || {};
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const subId = new mongoose.Types.ObjectId(subscriptionId);
    const sub = await Subscription.findById(subId).lean();
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    let list;
    if (singlePlanId && singleDuration && DURATIONS.includes(singleDuration)) {
      list = [{ planId: singlePlanId, duration: singleDuration }];
    } else {
      list = Array.isArray(assignments) ? assignments : [];
    }
    const valid = list
      .filter((a) => a && a.planId && DURATIONS.includes(a.duration))
      .map((a) => ({
        planId: mongoose.Types.ObjectId.isValid(a.planId) ? new mongoose.Types.ObjectId(a.planId) : null,
        duration: a.duration,
      }))
      .filter((a) => a.planId)
      .slice(0, 1);

    if (valid.length > 0) {
      const planExists = await BillingPlan.findById(valid[0].planId).lean();
      if (!planExists) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }
    }

    const startDate = new Date();
    const toInsert = valid.map(({ planId, duration }) => ({
      subscriptionId: subId,
      planId,
      startDate,
      duration,
      endDate: addDuration(startDate, duration),
    }));

    const previous = await SubscriptionPlanAssignment.find({ subscriptionId: subId }).lean();
    const previousPlanIds = new Set((previous || []).map((a) => a.planId.toString()));

    await SubscriptionPlanAssignment.deleteMany({ subscriptionId: subId });

    const newPlanIds = new Set(toInsert.map((a) => a.planId.toString()));

    for (const pid of previousPlanIds) {
      if (!newPlanIds.has(pid)) {
        await BillingSubscription.findOneAndUpdate(
          { planId: new mongoose.Types.ObjectId(pid) },
          { $pull: { subscriptionIds: subId } }
        );
      }
    }

    if (toInsert.length > 0) {
      await SubscriptionPlanAssignment.insertMany(toInsert);
      const isUpgrade = previous.length > 0;
      const firstInsert = toInsert[0];
      const planDoc = await BillingPlan.findById(firstInsert.planId).lean();
      const planName = planDoc?.name ?? '';
      await PlanAssignmentLog.create({
        subscriptionId: subId,
        subscriptionName: sub.fullName ?? '',
        planId: firstInsert.planId,
        planName,
        action: isUpgrade ? 'upgraded' : 'assigned',
        duration: firstInsert.duration,
        startDate: firstInsert.startDate,
        endDate: firstInsert.endDate,
      });
      let apiKey = generateApiKey();
      let exists = await Subscription.findOne({ apiKey, _id: { $ne: subId } }).lean();
      while (exists) {
        apiKey = generateApiKey();
        exists = await Subscription.findOne({ apiKey, _id: { $ne: subId } }).lean();
      }
      await Subscription.findByIdAndUpdate(subId, { $set: { apiKey } });

      for (const planId of newPlanIds) {
        await BillingSubscription.findOneAndUpdate(
          { planId: new mongoose.Types.ObjectId(planId) },
          { $addToSet: { subscriptionIds: subId } },
          { upsert: true }
        );
      }
    } else {
      await Subscription.findByIdAndUpdate(subId, { $unset: { apiKey: 1 } });
    }

    const allAssignments = await SubscriptionPlanAssignment.find({ subscriptionId: subId })
      .sort({ startDate: -1 })
      .lean();
    const plans = await BillingPlan.find({ _id: { $in: allAssignments.map((a) => a.planId) } }).lean();
    const planMap = Object.fromEntries(plans.map((p) => [p._id.toString(), p]));
    const now = new Date();
    const result = allAssignments.map((a) => {
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
      };
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
