import mongoose from 'mongoose';

const planAssignmentLogSchema = new mongoose.Schema(
  {
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    subscriptionName: { type: String, required: true, trim: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingPlan', required: true },
    planName: { type: String, required: true, trim: true },
    action: { type: String, required: true, enum: ['assigned', 'upgraded'] },
    duration: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

planAssignmentLogSchema.index({ createdAt: -1 });
planAssignmentLogSchema.index({ subscriptionId: 1 });
planAssignmentLogSchema.index({ planId: 1 });

export const PlanAssignmentLog = mongoose.model('PlanAssignmentLog', planAssignmentLogSchema);
