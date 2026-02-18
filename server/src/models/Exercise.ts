import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise extends Document {
  name: string;
  description: string;
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Full Body' | 'Balance' | 'Static';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  formTips: string[];
  commonMistakes: string[];
  videoUrl?: string;
  imageUrl?: string;
  progressions?: {
    easier: string[];
    harder: string[];
  };
}

const ExerciseSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Push', 'Pull', 'Core', 'Legs', 'Full Body', 'Balance', 'Static'], 
    required: true 
  },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    required: true 
  },
  instructions: [{ type: String }],
  primaryMuscles: [{ type: String }],
  secondaryMuscles: [{ type: String }],
  formTips: [{ type: String }],
  commonMistakes: [{ type: String }],
  videoUrl: { type: String },
  imageUrl: { type: String },
  progressions: {
    easier: [{ type: String }],
    harder: [{ type: String }]
  }
});

// Map _id to id for frontend compatibility
ExerciseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);
