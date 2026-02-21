import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    module_code: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

moduleSchema.index({ name: 1 });

export const Module = mongoose.model('Module', moduleSchema);
