import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  plan: 'free' | 'pro';
  goals: string[];
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    goals: { type: [String], default: [] },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
