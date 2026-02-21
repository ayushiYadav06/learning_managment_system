import mongoose from 'mongoose';

const adminEmailConfigSchema = new mongoose.Schema(
  {
    smtpHost: { type: String, required: true, trim: true },
    port: { type: Number, required: true, min: 1, max: 65535 },
    email: { type: String, required: true, trim: true, lowercase: true },
    encryptedPassword: { type: String, required: true },
  },
  { timestamps: true, collection: 'adminemailconfigs' }
);

export const AdminEmailConfig = mongoose.model('AdminEmailConfig', adminEmailConfigSchema);
