import mongoose, { Schema, Document } from 'mongoose';

export interface IExerciseSetLog {
  exerciseId: string;
  repsCompleted?: number;
  durationCompleted?: number;
  weight?: number;
}

export interface IWorkoutLog extends Document {
  userId: mongoose.Types.ObjectId;
  sessionType: 'workout' | 'skill' | 'exercise';
  workoutId?: mongoose.Types.ObjectId;
  skillId?: string;
  exerciseId?: string;
  sessionName?: string;
  date: Date;
  durationActual: number;
  notes?: string;
  xpGained: number;
  exercises: IExerciseSetLog[];
}

const ExerciseSetLogSchema = new Schema({
  exerciseId: { type: String, required: true },
  repsCompleted: { type: Number },
  durationCompleted: { type: Number },
  weight: { type: Number },
});

const WorkoutLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType: {
    type: String,
    enum: ['workout', 'skill', 'exercise'],
    default: 'workout',
    required: true
  },
  workoutId: { type: Schema.Types.ObjectId, ref: 'Workout' },
  skillId: { type: String },
  exerciseId: { type: String },
  sessionName: { type: String },
  date: { type: Date, default: Date.now },
  durationActual: { type: Number, required: true },
  notes: { type: String },
  xpGained: { type: Number, default: 0 },
  exercises: [ExerciseSetLogSchema],
});

// Map _id to id for frontend compatibility
WorkoutLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export default mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
