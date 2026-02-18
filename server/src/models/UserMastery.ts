import mongoose, { Schema, Document } from 'mongoose';

export interface IUserMastery extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: string;
  currentPoints: number;
  currentLevel: number;
  lastTrained: Date;
}

const UserMasterySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skillId: { type: String, required: true },
  currentPoints: { type: Number, default: 0 },
  currentLevel: { type: Number, default: 0 },
  lastTrained: { type: Date, default: Date.now },
});

// Ensure unique entry per user and skill
UserMasterySchema.index({ userId: 1, skillId: 1 }, { unique: true });

export default mongoose.model<IUserMastery>('UserMastery', UserMasterySchema);
