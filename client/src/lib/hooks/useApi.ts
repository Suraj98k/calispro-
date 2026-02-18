import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Skill, Exercise, UserProfile, UserSkillMastery, Workout, WorkoutHistory, StreakStats } from '@/types';

const getAuthScope = () => {
  if (typeof window === 'undefined') return 'server';
  const token = window.localStorage.getItem('authToken');
  if (!token) return 'anonymous';

  try {
    const parts = token.split('.');
    if (parts.length < 2) return 'anonymous';

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(window.atob(padded)) as { id?: string };
    return typeof payload.id === 'string' && payload.id.length ? payload.id : 'anonymous';
  } catch {
    return 'anonymous';
  }
};

// Profile Hooks
export const useProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>('/auth/me');
      return data;
    },
    enabled: options?.enabled ?? true,
    retry: false, // Don't retry profile fetch if it fails (likely 401)
  });
};

// Skill Hooks
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await apiClient.get<Skill[]>('/skills');
      return data;
    },
  });
};

export const useUserMastery = () => {
  return useQuery({
    queryKey: ['user-mastery'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserSkillMastery[]>('/skills/user/progress');
      return data;
    },
  });
};

// Exercise Hooks
export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data } = await apiClient.get<Exercise[]>('/exercises');
      return data;
    },
  });
};

export const useExerciseById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Exercise>(`/exercises/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

// Workout Hooks
export const useWorkouts = () => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['workouts', authScope],
    queryFn: async () => {
      const { data } = await apiClient.get<Workout[]>('/workouts');
      return data;
    },
  });
};

export const useWorkoutById = (id: string, options?: { enabled?: boolean }) => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['workouts', authScope, id],
    queryFn: async () => {
      const { data } = await apiClient.get<Workout>(`/workouts/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      imageUrl?: string;
      level: 'Beginner' | 'Intermediate' | 'Advanced';
      durationEstimate: number;
      exercises: {
        exerciseId: string;
        sets: number;
        reps?: number | string;
        duration?: number;
      }[];
    }) => {
      const { data } = await apiClient.post<Workout>('/workouts', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useSkillById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['skills', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Skill>(`/skills/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

// Workout History Hook
export const useWorkoutHistory = (limit: number = 5) => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['workout-history', authScope, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<WorkoutHistory[]>('/logs/history', { params: { limit } });
      return data;
    },
  });
};

export const useStreakStats = () => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['streak-stats', authScope],
    queryFn: async () => {
      const { data } = await apiClient.get<StreakStats>('/logs/streaks');
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile> & { goals?: string[] }) => {
      const { data } = await apiClient.patch('/auth/profile', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Logging / Mutation Hooks
export const useLogWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workoutData: {
      sessionType?: 'workout' | 'skill' | 'exercise';
      workoutId?: string;
      skillId?: string;
      exerciseId?: string;
      sessionName?: string;
      durationActual: number;
      notes: string;
      xpGained: number;
      exercises: { exerciseId: string; repsCompleted?: number; durationCompleted?: number }[];
    }) => {
      const { data } = await apiClient.post('/logs', workoutData);
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['streak-stats'] });
    },
  });
};

export const useUpdateMasteryPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { skillId: string; points: number }) => {
      const { data } = await apiClient.post('/skills/user/progress', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useDeleteHistoryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (historyId: string) => {
      await apiClient.delete(`/logs/history/${historyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['streak-stats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
    },
  });
};

export const useDeleteAllHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/logs/history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['streak-stats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
    },
  });
};
