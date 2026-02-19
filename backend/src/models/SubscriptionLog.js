import mongoose from 'mongoose';

const subscriptionLogSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    assignedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    action: { type: String, default: 'Modules Assigned' },
  },
  { timestamps: true }
);

subscriptionLogSchema.index({ subscriptionId: 1 });
subscriptionLogSchema.index({ createdAt: -1 });

export const SubscriptionLog = mongoose.model('SubscriptionLog', subscriptionLogSchema);
