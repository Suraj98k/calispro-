import mongoose, { Schema, Document } from 'mongoose';

export interface IMasteryLevel {
  level: number;
  label: string;
  pointsRequired: number;
  unlockedExercises: string[];
}

export interface ISkill extends Document {
  name: string;
  description: string;
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Balance' | 'Static';
  icon: string;
  prerequisites: string[];
  masteryLevels: IMasteryLevel[];
}

const MasteryLevelSchema = new Schema({
  level: { type: Number, required: true },
  label: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  unlockedExercises: [{ type: String }],
});

const SkillSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Push', 'Pull', 'Core', 'Legs', 'Balance', 'Static'], 
    required: true 
  },
  icon: { type: String, required: true },
  prerequisites: [{ type: String }],
  masteryLevels: [MasteryLevelSchema],
});

// Map _id to id for frontend compatibility
SkillSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export default mongoose.model<ISkill>('Skill', SkillSchema);
