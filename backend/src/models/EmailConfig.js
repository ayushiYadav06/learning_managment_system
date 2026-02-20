import mongoose from 'mongoose';

const emailConfigSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      unique: true,
    },
    smtpHost: { type: String, required: true, trim: true },
    port: { type: Number, required: true, min: 1, max: 65535 },
    email: { type: String, required: true, trim: true, lowercase: true },
    encryptedPassword: { type: String, required: true },
  },
  { timestamps: true }
);

emailConfigSchema.index({ subscriptionId: 1 });

export const EmailConfig = mongoose.model('EmailConfig', emailConfigSchema);
