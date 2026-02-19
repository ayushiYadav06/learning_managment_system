/**
 * Seed default modules. Run: node src/scripts/seed.js
 * Ensure MONGODB_URI is set (e.g. in .env) or uses default.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Module } from '../models/Module.js';

dotenv.config();

const defaultModules = [
  { name: 'Chatbot', description: 'AI-powered chatbot for student support' },
  { name: 'Exam', description: 'Online examination system' },
  { name: 'Certificate', description: 'Certificate generation and management' },
  { name: 'Coupon', description: 'Discount coupon management' },
  { name: 'Reports', description: 'Analytics and reporting dashboard' },
  { name: 'Attendance', description: 'Student attendance tracking' },
  { name: 'Calendar', description: 'Academic calendar management' },
  { name: 'Document Manager', description: 'Document storage and management' },
  { name: 'Support', description: '24/7 customer support system' },
];

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_billing';

async function seed() {
  await mongoose.connect(uri);
  const existing = await Module.countDocuments();
  if (existing > 0) {
    console.log('Modules already exist, skipping seed.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }
  await Module.insertMany(defaultModules);
  console.log('Seeded', defaultModules.length, 'default modules.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
