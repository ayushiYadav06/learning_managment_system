import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['Individual', 'Hybrid', 'Institute/School'],
    },
    username: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    apiKey: { type: String, default: null, sparse: true, maxlength: 256 },
  },
  { timestamps: true }
);

subscriptionSchema.index({ type: 1 });
subscriptionSchema.index({ username: 1 });
subscriptionSchema.index({ apiKey: 1 }, { unique: true, sparse: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
