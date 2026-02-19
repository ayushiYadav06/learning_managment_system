import mongoose from 'mongoose';

const billingSubscriptionSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BillingPlan',
      required: true,
      unique: true,
    },
    subscriptionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
  },
  { timestamps: true }
);

billingSubscriptionSchema.index({ planId: 1 });

export const BillingSubscription = mongoose.model('BillingSubscription', billingSubscriptionSchema);
