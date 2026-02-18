import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number | string;
  duration?: number;
}

export interface IWorkout extends Document {
  name: string;
  description: string;
  imageUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: IWorkoutExercise[];
  durationEstimate: number;
  isGlobal: boolean;
  creatorId?: mongoose.Types.ObjectId;
}

const WorkoutExerciseSchema = new Schema({
  exerciseId: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Schema.Types.Mixed }, // Can be number or string (e.g., 'max')
  duration: { type: Number },
});

const WorkoutSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  exercises: [WorkoutExerciseSchema],
  durationEstimate: { type: Number, required: true },
  isGlobal: { type: Boolean, default: false },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Map _id to id for frontend compatibility
WorkoutSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
