import { BillingSubscriptionLog } from '../models/BillingSubscriptionLog.js';
import mongoose from 'mongoose';

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
