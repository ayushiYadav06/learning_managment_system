import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const billingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 },
    addons: [addonSchema],
  },
  { timestamps: true }
);

billingPlanSchema.index({ name: 1 });

export const BillingPlan = mongoose.model('BillingPlan', billingPlanSchema);
