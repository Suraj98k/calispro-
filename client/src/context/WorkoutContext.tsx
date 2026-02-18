'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { UserProfile, WorkoutHistory, Workout, WorkoutPerformance } from '@/types';
import { useAuth } from './AuthContext';
import { useWorkoutHistory } from '@/lib/hooks/useApi';

interface WorkoutContextType {
    userProfile: UserProfile;
    workoutHistory: WorkoutHistory[];
    masteryPoints: number;
    completeWorkout: (workout: Workout, duration: number, performance: WorkoutPerformance[]) => void;
    updatePoints: (points: number) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { data: liveHistory } = useWorkoutHistory(100);
    const [localHistory, setLocalHistory] = useState<WorkoutHistory[]>([]);
    const [masteryPoints, setMasteryPoints] = useState(365); // Initial points from dashboard metrics

    const userProfile = user || { id: 'temp', name: 'User', email: '', level: 'Beginner' } as UserProfile;
    const workoutHistory = useMemo(
        () => [...localHistory, ...(liveHistory || [])],
        [localHistory, liveHistory]
    );

    const completeWorkout = (workout: Workout, duration: number, performance: WorkoutPerformance[]) => {
        const exercises = performance.map((entry) => {
            const repsCompleted = entry.setsCompleted.reduce((sum, set) => sum + (typeof set.reps === 'number' ? set.reps : 0), 0);
            const durationCompleted = entry.setsCompleted.reduce((sum, set) => sum + (set.duration || 0), 0);
            return {
                exerciseId: entry.exerciseId,
                repsCompleted: repsCompleted > 0 ? repsCompleted : undefined,
                durationCompleted: durationCompleted > 0 ? durationCompleted : undefined,
            };
        });

        // Generate new history entry
        const newEntry: WorkoutHistory = {
            id: `history-${Date.now()}`,
            userId: userProfile.id,
            workoutId: workout.id,
            date: new Date().toISOString(),
            durationActual: duration,
            exercises,
        };

        setLocalHistory(prev => [newEntry, ...prev]);

        // Simple point logic: 50 XP per completed workout + 10 XP per exercise
        const earnedPoints = 50 + (workout.exercises.length * 10);
        setMasteryPoints(prev => prev + earnedPoints);
    };

    const updatePoints = (points: number) => {
        setMasteryPoints(prev => prev + points);
    };

    return (
        <WorkoutContext.Provider value={{
            userProfile,
            workoutHistory,
            masteryPoints,
            completeWorkout,
            updatePoints
        }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);
    if (context === undefined) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
}
