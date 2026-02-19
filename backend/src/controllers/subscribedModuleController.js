import { SubscribedModule } from '../models/SubscribedModule.js';
import { SubscriptionLog } from '../models/SubscriptionLog.js';
import { toResponse } from '../utils/serialize.js';
import mongoose from 'mongoose';

/**
 * GET /api/subscriptions/:subscriptionId/modules
 * Returns array of assigned module IDs (strings).
 */
export async function getAssignedModules(req, res) {
  try {
    const { subscriptionId } = req.params;
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const subId = new mongoose.Types.ObjectId(subscriptionId);
    const doc = await SubscribedModule.findOne({ subscriptionId: subId }).lean();
    const moduleIds = (doc?.moduleIds || []).map((id) => id.toString());
    return res.json(moduleIds);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/subscriptions/:subscriptionId/modules
 * Body: { moduleIds: string[] }
 * Upserts subscribed-modules and creates a subscription-log entry.
 */
export async function assignModules(req, res) {
  try {
    const { subscriptionId } = req.params;
    const { moduleIds } = req.body || {};
    if (!mongoose.isValidObjectId(subscriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription ID' });
    }
    const ids = Array.isArray(moduleIds)
      ? moduleIds
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => new mongoose.Types.ObjectId(id))
      : [];
    const subId = new mongoose.Types.ObjectId(subscriptionId);

    await SubscribedModule.findOneAndUpdate(
      { subscriptionId: subId },
      { $set: { moduleIds: ids } },
      { upsert: true, new: true }
    );

    await SubscriptionLog.create({
      subscriptionId: subId,
      assignedModules: ids,
      action: 'Modules Assigned',
    });

    const doc = await SubscribedModule.findOne({ subscriptionId: subId }).lean();
    return res.json(toResponse(doc));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
