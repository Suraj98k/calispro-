// client/src/types/index.ts

export interface MasteryLevel {
  level: number;
  label: string;
  pointsRequired: number;
  unlockedExercises: string[]; // IDs of exercises
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Balance' | 'Static';
  icon: string; // Lucide icon name
  masteryLevels: MasteryLevel[];
  prerequisites?: string[]; // IDs of other skills
}

export interface UserSkillMastery {
  skillId: string;
  currentPoints: number;
  currentLevel: number;
  lastTrained?: string; // ISO string
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  goals?: string[];
  avatarUrl?: string;
  mastery?: UserSkillMastery[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Full Body' | 'Balance' | 'Static';
  instructions: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  formTips: string[];
  commonMistakes: string[];
  videoUrl?: string;
  imageUrl?: string;
  progressions?: {
    easier?: string[];
    harder?: string[];
  };
}

export interface WorkoutExercise {
  exerciseId: string;
  sets?: number;
  reps?: number | string;
  duration?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: WorkoutExercise[];
  durationEstimate?: number;
  isRecommended?: boolean;
  isGlobal?: boolean;
  creatorId?: string;
}

export interface WorkoutPerformance {
  exerciseId: string;
  setsCompleted: { reps?: number | string; duration?: number }[];
  notes?: string;
}

export interface WorkoutHistory {
  id: string;
  userId: string;
  sessionType?: 'workout' | 'skill' | 'exercise';
  workoutId?: string;
  skillId?: string;
  exerciseId?: string;
  sessionName?: string;
  date: string;
  durationActual: number;
  exercises?: {
    exerciseId: string;
    repsCompleted?: number;
    durationCompleted?: number;
    weight?: number;
  }[];
  xpGained?: number;
  notes?: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  hasTrainedToday: boolean;
  lastActiveDate: string | null;
}
