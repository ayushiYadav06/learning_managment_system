import { BillingSubscriptionLog } from '../models/BillingSubscriptionLog.js';
import mongoose from 'mongoose';

/**
 * GET /api/billing-subscription-logs
 * List all billing subscription logs with plan name and subscription names.
 */
export async function listAll(req, res) {
  try {
    const list = await BillingSubscriptionLog.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'billingplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'assignedSubscriptions',
          foreignField: '_id',
          as: 'subscriptionDocs',
        },
      },
      {
        $project: {
          id: { $toString: '$_id' },
          date: '$createdAt',
          planId: { $toString: '$planId' },
          planName: '$plan.name',
          assignedSubscriptionIds: { $map: { input: '$assignedSubscriptions', as: 'sid', in: { $toString: '$$sid' } } },
          assignedSubscriptionNames: '$subscriptionDocs.fullName',
          action: 1,
        },
      },
    ]);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/billing-plans/:planId/logs
 */
export async function getByPlanId(req, res) {
  try {
    const { planId } = req.params;
    if (!mongoose.isValidObjectId(planId)) {
      return res.status(400).json({ success: false, message: 'Invalid plan ID' });
    }
    const planIdObj = new mongoose.Types.ObjectId(planId);
    const list = await BillingSubscriptionLog.find({ planId: planIdObj })
      .sort({ createdAt: -1 })
      .lean();
    const out = list.map((doc) => ({
      ...doc,
      id: doc._id.toString(),
      date: doc.createdAt?.toISOString?.() || doc.createdAt,
      assignedSubscriptions: (doc.assignedSubscriptions || []).map((id) => id.toString()),
    }));
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
