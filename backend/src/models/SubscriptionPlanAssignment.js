import mongoose from 'mongoose';

const DURATIONS = ['4-month', '8-month', '12-month', '2-year', '4-year'];

const subscriptionPlanAssignmentSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BillingPlan',
      required: true,
    },
    startDate: { type: Date, required: true },
    duration: {
      type: String,
      required: true,
      enum: DURATIONS,
    },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

subscriptionPlanAssignmentSchema.index({ subscriptionId: 1 });
subscriptionPlanAssignmentSchema.index({ endDate: 1 });

export const DURATION_OPTIONS = DURATIONS;
export const SubscriptionPlanAssignment = mongoose.model(
  'SubscriptionPlanAssignment',
  subscriptionPlanAssignmentSchema
);
