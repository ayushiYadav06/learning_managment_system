import mongoose from 'mongoose';

const subscribedModuleSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      unique: true,
    },
    moduleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  },
  { timestamps: true }
);

subscribedModuleSchema.index({ subscriptionId: 1 });

export const SubscribedModule = mongoose.model('SubscribedModule', subscribedModuleSchema);
