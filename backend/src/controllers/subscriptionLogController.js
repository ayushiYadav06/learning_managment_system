import { PlanAssignmentLog } from '../models/PlanAssignmentLog.js';

/**
 * GET /api/subscription-logs
 * List subscription-assigned-to-plan logs: when a subscription is assigned or upgraded to a plan.
 */
export async function listAll(req, res) {
  try {
    const list = await PlanAssignmentLog.find().sort({ createdAt: -1 }).lean();
    const items = list.map((doc) => ({
      id: doc._id.toString(),
      date: doc.createdAt,
      subscriptionId: doc.subscriptionId?.toString(),
      subscriptionName: doc.subscriptionName ?? '',
      planId: doc.planId?.toString(),
      planName: doc.planName ?? '',
      action: doc.action === 'upgraded' ? 'Upgraded' : 'Assigned',
      duration: doc.duration,
      startDate: doc.startDate,
      endDate: doc.endDate,
    }));
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

