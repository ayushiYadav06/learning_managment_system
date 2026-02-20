import mongoose from 'mongoose';

const subscriptionActivityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, enum: ['masters_updated', 'plan_updated', 'plan_created', 'plan_deleted'] },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    subscriptionName: { type: String, trim: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingPlan' },
    planName: { type: String, trim: true },
    details: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

subscriptionActivityLogSchema.index({ createdAt: -1 });
subscriptionActivityLogSchema.index({ subscriptionId: 1 });
subscriptionActivityLogSchema.index({ planId: 1 });

export const SubscriptionActivityLog = mongoose.model(
  'SubscriptionActivityLog',
  subscriptionActivityLogSchema
);
