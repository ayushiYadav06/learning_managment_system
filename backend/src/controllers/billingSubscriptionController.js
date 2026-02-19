import { BillingSubscription } from '../models/BillingSubscription.js';
import { BillingSubscriptionLog } from '../models/BillingSubscriptionLog.js';
import { toResponse } from '../utils/serialize.js';
import mongoose from 'mongoose';

/**
 * GET /api/billing-plans/:planId/subscriptions
 * Returns array of assigned subscription IDs (strings).
 */
export async function getAssignedSubscriptions(req, res) {
  try {
    const { planId } = req.params;
    if (!mongoose.isValidObjectId(planId)) {
      return res.status(400).json({ success: false, message: 'Invalid plan ID' });
    }
    const planIdObj = new mongoose.Types.ObjectId(planId);
    const doc = await BillingSubscription.findOne({ planId: planIdObj }).lean();
    const subscriptionIds = (doc?.subscriptionIds || []).map((id) => id.toString());
    return res.json(subscriptionIds);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/billing-plans/:planId/subscriptions
 * Body: { subscriptionIds: string[] }
 * Upserts billing-subscriptions and creates billing-subscription-log.
 */
export async function assignSubscriptions(req, res) {
  try {
    const { planId } = req.params;
    const { subscriptionIds } = req.body || {};
    if (!mongoose.isValidObjectId(planId)) {
      return res.status(400).json({ success: false, message: 'Invalid plan ID' });
    }
    const ids = Array.isArray(subscriptionIds)
      ? subscriptionIds
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => new mongoose.Types.ObjectId(id))
      : [];
    const planIdObj = new mongoose.Types.ObjectId(planId);

    await BillingSubscription.findOneAndUpdate(
      { planId: planIdObj },
      { $set: { subscriptionIds: ids } },
      { upsert: true, new: true }
    );

    await BillingSubscriptionLog.create({
      planId: planIdObj,
      assignedSubscriptions: ids,
      action: 'Subscriptions Assigned',
    });

    const doc = await BillingSubscription.findOne({ planId: planIdObj }).lean();
    return res.json(toResponse(doc));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
