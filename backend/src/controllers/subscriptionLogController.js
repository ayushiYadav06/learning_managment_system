import { SubscriptionLog } from '../models/SubscriptionLog.js';
import { toResponseList } from '../utils/serialize.js';
import mongoose from 'mongoose';

/**
 * GET /api/subscriptions/:subscriptionId/logs
 */
export async function getBySubscriptionId(req, res) {
  try {
    const { subscriptionId } = req.params;
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const subId = new mongoose.Types.ObjectId(subscriptionId);
    const list = await SubscriptionLog.find({ subscriptionId: subId })
      .sort({ createdAt: -1 })
      .lean();
    const out = list.map((doc) => ({
      ...doc,
      id: doc._id.toString(),
      date: doc.createdAt?.toISOString?.() || doc.createdAt,
      assignedModules: (doc.assignedModules || []).map((id) => id.toString()),
    }));
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
