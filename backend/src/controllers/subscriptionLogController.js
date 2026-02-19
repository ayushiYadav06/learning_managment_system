import { SubscriptionLog } from '../models/SubscriptionLog.js';
import mongoose from 'mongoose';

/**
 * GET /api/subscription-logs
 * List all subscription logs with subscription name and module names.
 */
export async function listAll(req, res) {
  try {
    const list = await SubscriptionLog.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscriptionId',
          foreignField: '_id',
          as: 'subscription',
        },
      },
      { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'modules',
          localField: 'assignedModules',
          foreignField: '_id',
          as: 'moduleDocs',
        },
      },
      {
        $project: {
          id: { $toString: '$_id' },
          date: '$createdAt',
          subscriptionId: { $toString: '$subscriptionId' },
          subscriptionName: '$subscription.fullName',
          assignedModuleIds: { $map: { input: '$assignedModules', as: 'mid', in: { $toString: '$$mid' } } },
          assignedModuleNames: '$moduleDocs.name',
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
