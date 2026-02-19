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
  },
  { timestamps: true }
);

subscriptionSchema.index({ type: 1 });
subscriptionSchema.index({ username: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
