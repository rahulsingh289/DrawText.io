import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  tier: { 
    type: String, 
    enum: ['plan_a', 'plan_b', 'plan_c'], 
    default: 'plan_a' 
  },
  accountStatus: { type: String, default: 'Active' },
  usage: {
    storageBytes: { type: Number, default: 0 },
    notesCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
