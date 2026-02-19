import mongoose from 'mongoose';

const billingSubscriptionLogSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BillingPlan',
      required: true,
    },
    assignedSubscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
    action: { type: String, default: 'Subscriptions Assigned' },
  },
  { timestamps: true }
);

billingSubscriptionLogSchema.index({ planId: 1 });
billingSubscriptionLogSchema.index({ createdAt: -1 });

export const BillingSubscriptionLog = mongoose.model(
  'BillingSubscriptionLog',
  billingSubscriptionLogSchema
);
