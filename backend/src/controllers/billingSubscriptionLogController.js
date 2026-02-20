import { SubscriptionActivityLog } from '../models/SubscriptionActivityLog.js';

const PLAN_ACTIONS = ['plan_created', 'plan_deleted', 'plan_updated'];

const actionLabel = (action) => {
  if (action === 'plan_updated') return 'Plan updated';
  if (action === 'plan_created') return 'Plan created';
  if (action === 'plan_deleted') return 'Plan deleted';
  return action;
};

/**
 * GET /api/billing-subscription-logs
 * List plan lifecycle logs only: plan created, plan deleted, plan updated.
 */
export async function listAll(req, res) {
  try {
    const activityLogs = await SubscriptionActivityLog.find({ action: { $in: PLAN_ACTIONS } })
      .sort({ createdAt: -1 })
      .lean();
    const items = activityLogs.map((doc) => ({
      id: doc._id.toString(),
      date: doc.createdAt,
      subscriptionId: doc.subscriptionId?.toString() ?? null,
      subscriptionName: doc.subscriptionName ?? null,
      planId: doc.planId?.toString() ?? null,
      planName: doc.planName ?? null,
      action: actionLabel(doc.action),
      duration: null,
      startDate: null,
      endDate: null,
      details: doc.details ?? null,
    }));
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
