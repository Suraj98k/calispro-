'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  ImageIcon,
  SkipForward,
  Timer,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { getExerciseVisual } from '@/lib/exerciseVisuals';
import {
  useExerciseById,
  useExercises,
  useLogWorkout,
  useSkillById,
  useSkills,
  useUpdateMasteryPoints,
  useUserMastery,
  useWorkoutById,
} from '@/lib/hooks/useApi';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types';

type SessionMode = 'workout' | 'skill' | 'exercise';

type PlannedEntry = {
  exerciseId: string;
  sets: number;
  reps: number;
  duration?: number;
};

type SetState = {
  value: number;
  completed: boolean;
};

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const findExerciseByRef = (allExercises: Exercise[] | undefined, ref: string) => {
  if (!allExercises?.length) return undefined;
  return allExercises.find((entry) => entry.id === ref || normalizeText(entry.name) === normalizeText(ref));
};

const getDefaultSets = (exercise: Exercise | undefined) => {
  if (!exercise) return 3;
  if (exercise.level === 'Advanced') return 5;
  if (exercise.level === 'Intermediate') return 4;
  return 3;
};

const getDefaultTarget = (exercise: Exercise | undefined) => {
  if (!exercise) return 10;
  if (exercise.category === 'Static' || exercise.category === 'Balance') return 30;
  if (exercise.level === 'Advanced') return 6;
  if (exercise.level === 'Intermediate') return 8;
  return 10;
};

const getWorkDurationSeconds = (plan: PlannedEntry | undefined, setValue?: number) => {
  if (!plan) return 30;
  if (plan.duration) return Math.max(1, setValue || plan.duration || 30);
  const repsTarget = Math.max(1, setValue || plan.reps || 10);
  return Math.max(20, Math.min(180, repsTarget * 4));
};

const exerciseFallbackImages: Record<Exercise['category'], string> = {
  Push: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  Pull: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1200&auto=format&fit=crop',
  Core: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  Legs: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1200&auto=format&fit=crop',
  'Full Body': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop',
  Balance: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop',
  Static: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
};

const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return null;
  const trimmed = url.trim();
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const regularMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (regularMatch?.[1]) return `https://www.youtube.com/embed/${regularMatch[1]}`;

  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  return null;
};

export default function TrackingPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const modeParam = (searchParams.get('mode') || 'workout').toLowerCase();
  const mode: SessionMode = modeParam === 'skill' || modeParam === 'exercise' ? modeParam : 'workout';
  const sessionId = workoutId;

  const { data: exercises, isLoading: isExercisesLoading } = useExercises();
  const { data: skills, isLoading: isSkillsLoading } = useSkills();

  const { data: workout, isLoading: isWorkoutLoading } = useWorkoutById(sessionId, { enabled: mode === 'workout' });
  const { data: skillById, isLoading: isSkillLoading } = useSkillById(sessionId, { enabled: mode === 'skill' });
  const { data: directExercise, isLoading: isExerciseLoading } = useExerciseById(sessionId, { enabled: mode === 'exercise' });
  const { data: mastery, isLoading: isMasteryLoading } = useUserMastery();

  const { mutateAsync: logWorkout, isPending: isLogging } = useLogWorkout();
  const { mutateAsync: updateMastery, isPending: isUpdatingMastery } = useUpdateMasteryPoints();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, SetState[]>>({});
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionStartTime] = useState(new Date());
  const [isFinished, setIsFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [activeRestSet, setActiveRestSet] = useState<{ exerciseId: string; setIndex: number } | null>(null);
  const [timerPhase, setTimerPhase] = useState<'work' | 'rest' | null>(null);
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null);

  const skill = useMemo(() => {
    if (mode !== 'skill') return undefined;
    if (skillById) return skillById;
    return skills?.find((item) => item.id === sessionId || (item as { _id?: string })._id === sessionId);
  }, [mode, skillById, skills, sessionId]);

  const nextSuggestedExercise = useMemo(() => {
    if (mode !== 'exercise' || !directExercise || !exercises?.length) return undefined;

    const progressionRefs = [
      ...(directExercise.progressions?.harder || []),
      ...(directExercise.progressions?.easier || []),
    ];

    for (const ref of progressionRefs) {
      const found = findExerciseByRef(exercises, ref);
      if (found && found.id !== directExercise.id) return found;
    }

    const levelRank: Record<Exercise['level'], number> = {
      Beginner: 0,
      Intermediate: 1,
      Advanced: 2,
    };
    const currentLevelRank = levelRank[directExercise.level];

    return exercises.find(
      (entry) =>
        entry.id !== directExercise.id &&
        entry.category === directExercise.category &&
        levelRank[entry.level] >= currentLevelRank
    );
  }, [mode, directExercise, exercises]);

  const plannedEntries = useMemo<PlannedEntry[]>(() => {
    if (!exercises?.length) return [];

    if (mode === 'workout' && workout) {
      return workout.exercises.map((entry) => {
        const exercise = findExerciseByRef(exercises, entry.exerciseId);
        return {
          exerciseId: exercise?.id || entry.exerciseId,
          sets: Number(entry.sets) || getDefaultSets(exercise),
          reps: typeof entry.reps === 'number' ? entry.reps : getDefaultTarget(exercise),
          duration: entry.duration,
        };
      });
    }

    if (mode === 'exercise' && directExercise) {
      return [
        {
          exerciseId: directExercise.id,
          sets: getDefaultSets(directExercise),
          reps: getDefaultTarget(directExercise),
          duration: directExercise.category === 'Static' || directExercise.category === 'Balance' ? 30 : undefined,
        },
      ];
    }

    if (mode === 'skill' && skill) {
      const userMastery = mastery?.find((entry) => entry.skillId === skill.name);
      const currentLevel = userMastery?.currentLevel ?? 0;

      const unlockedRefs = skill.masteryLevels
        .filter((level) => level.level <= currentLevel)
        .flatMap((level) => level.unlockedExercises);

      const fallbackRefs = unlockedRefs.length ? unlockedRefs : (skill.masteryLevels[0]?.unlockedExercises || []);
      const unique = new Map<string, PlannedEntry>();

      fallbackRefs.forEach((exerciseRef) => {
        const exercise = findExerciseByRef(exercises, exerciseRef);
        if (!exercise) return;
        if (unique.has(exercise.id)) return;

        unique.set(exercise.id, {
          exerciseId: exercise.id,
          sets: getDefaultSets(exercise),
          reps: getDefaultTarget(exercise),
          duration: exercise.category === 'Static' || exercise.category === 'Balance' ? 30 : undefined,
        });
      });

      return Array.from(unique.values());
    }

    return [];
  }, [mode, workout, directExercise, skill, mastery, exercises]);

  const isLoading =
    isExercisesLoading ||
    (mode === 'workout' && isWorkoutLoading) ||
    (mode === 'exercise' && isExerciseLoading) ||
    (mode === 'skill' && (isSkillLoading || isMasteryLoading || isSkillsLoading));

  const isSaving = isLogging || isUpdatingMastery;

  useEffect(() => {
    if (!plannedEntries.length) return;

    const initialSets: Record<string, SetState[]> = {};
    plannedEntries.forEach((entry) => {
      initialSets[entry.exerciseId] = Array(entry.sets)
        .fill(null)
        .map(() => ({ value: entry.duration || entry.reps, completed: false }));
    });

    setCompletedSets(initialSets);
    setCurrentExerciseIndex(0);
    setIsFinished(false);
    setTimerActive(false);
    setTimeLeft(60);
    setActiveRestSet(null);
    setTimerPhase(null);
    setActiveSetIndex(null);
  }, [sessionId, mode, plannedEntries]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isFinished) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isFinished]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const playAudioCue = (frequency = 880, durationMs = 180) => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.03;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    window.setTimeout(() => {
      oscillator.stop();
      context.close().catch(() => null);
    }, durationMs);
  };

  const timerPlan = plannedEntries[currentExerciseIndex];
  const timerExerciseId = timerPlan?.exerciseId;

  useEffect(() => {
    if (!timerActive || timeLeft > 0 || timerPhase === null || activeSetIndex === null || !timerPlan || !timerExerciseId) return;

    if (timerPhase === 'work') {
      setCompletedSets((prev) => {
        const sets = [...(prev[timerExerciseId] || [])];
        if (sets[activeSetIndex] && !sets[activeSetIndex].completed) {
          sets[activeSetIndex] = { ...sets[activeSetIndex], completed: true };
        }
        return { ...prev, [timerExerciseId]: sets };
      });
      setTimerPhase('rest');
      setActiveRestSet({ exerciseId: timerExerciseId, setIndex: activeSetIndex });
      setTimeLeft(60);
      playAudioCue(660, 220);
      toast.success(`Set ${activeSetIndex + 1} complete. Rest now.`);
      return;
    }

    const sets = completedSets[timerExerciseId] || [];
    const nextSet = activeSetIndex + 1;
    if (nextSet < sets.length) {
      setActiveSetIndex(nextSet);
      setTimerPhase('work');
      setActiveRestSet(null);
      setTimeLeft(getWorkDurationSeconds(timerPlan, sets[nextSet]?.value));
      playAudioCue(990, 180);
      toast.success(`Set ${nextSet + 1} started.`);
      return;
    }

    setTimerActive(false);
    setTimerPhase(null);
    setActiveSetIndex(null);
    setActiveRestSet(null);
    setTimeLeft(60);
    playAudioCue(740, 280);
    toast.success('Exercise flow complete.');
  }, [timerActive, timeLeft, timerPhase, activeSetIndex, timerPlan, timerExerciseId, completedSets]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!plannedEntries.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <p className="text-soft">Session data not found or no exercises are available for this session.</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const currentPlan = plannedEntries[currentExerciseIndex];
  const exercise = findExerciseByRef(exercises, currentPlan.exerciseId);
  const currentSets = completedSets[currentPlan.exerciseId] || [];
  const visual = exercise ? getExerciseVisual(exercise.category) : null;
  const currentExerciseDone = currentSets.length > 0 && currentSets.every((set) => set.completed);
  const exerciseVideoUrl = getYouTubeEmbedUrl(exercise?.videoUrl);
  const exerciseImageUrl = exercise?.imageUrl || (exercise ? exerciseFallbackImages[exercise.category] : null);

  const allDone = plannedEntries.every((entry) => (completedSets[entry.exerciseId] || []).every((set) => set.completed));

  const updateCurrentSet = (setIndex: number, updater: (set: SetState) => SetState) => {
    setCompletedSets((prev) => {
      const sets = [...(prev[currentPlan.exerciseId] || [])];
      sets[setIndex] = updater(sets[setIndex]);
      return { ...prev, [currentPlan.exerciseId]: sets };
    });
  };

  const startExerciseFlow = () => {
    if (!currentSets.length || currentExerciseDone) return;
    setActiveSetIndex(0);
    setTimerPhase('work');
    setTimeLeft(getWorkDurationSeconds(currentPlan, currentSets[0]?.value));
    setTimerActive(true);
    setActiveRestSet(null);
    playAudioCue(990, 180);
    toast.success('Set 1 started.');
  };

  const handleToggleSet = (setIndex: number) => {
    if (timerPhase) {
      toast.error('Guided timer is running. Wait for the current phase to finish.');
      return;
    }

    const current = currentSets[setIndex];
    const willComplete = !current?.completed;
    updateCurrentSet(setIndex, (set) => ({ ...set, completed: !set.completed }));

    if (willComplete) {
      setTimeLeft(60);
      setTimerActive(true);
      setActiveRestSet({ exerciseId: currentPlan.exerciseId, setIndex });
      return;
    }

    if (activeRestSet && activeRestSet.exerciseId === currentPlan.exerciseId && activeRestSet.setIndex === setIndex) {
      setTimerActive(false);
      setTimeLeft(60);
      setActiveRestSet(null);
    }
  };

  const handleUpdateValue = (setIndex: number, delta: number) => {
    updateCurrentSet(setIndex, (set) => ({
      ...set,
      value: Math.max(1, set.value + delta),
    }));
  };

  const computeMasteryPoints = () => {
    return plannedEntries.reduce((points, entry) => {
      const sets = completedSets[entry.exerciseId] || [];
      return (
        points +
        sets.reduce((acc, set) => {
          if (!set.completed) return acc;
          return acc + 8 + Math.round(set.value / 5);
        }, 0)
      );
    }, 0);
  };

  const finishSession = async (options?: { skipCompletionScreen?: boolean }) => {
    try {
      const duration = Math.max(1, Math.round((Date.now() - sessionStartTime.getTime()) / 60000));
      const performance = plannedEntries.map((entry) => {
        const sets = completedSets[entry.exerciseId] || [];
        const totalCompletedValue = sets.reduce((sum, set) => sum + (set.completed ? set.value : 0), 0);
        return {
          exerciseId: entry.exerciseId,
          repsCompleted: entry.duration ? undefined : totalCompletedValue,
          durationCompleted: entry.duration ? totalCompletedValue : undefined,
        };
      });

      if (mode === 'workout') {
        if (!workout) throw new Error('Workout data missing');

        const xpGained = performance.reduce((sum, entry) => sum + Math.round((entry.repsCompleted || 0) / 2), 50);

        await logWorkout({
          sessionType: 'workout',
          workoutId: workout.id,
          sessionName: workout.name,
          durationActual: duration,
          notes: 'Completed via tracker',
          xpGained,
          exercises: performance,
        });
      } else if (mode === 'skill') {
        if (!skill) throw new Error('Skill data missing');

        const points = Math.max(10, computeMasteryPoints());
        await updateMastery({ skillId: skill.name, points });
        await logWorkout({
          sessionType: 'skill',
          skillId: skill.name,
          sessionName: `${skill.name} Mastery Session`,
          durationActual: duration,
          notes: 'Skill mastery session completed via tracker',
          xpGained: points,
          exercises: performance,
        });
      } else {
        if (!directExercise) throw new Error('Exercise data missing');

        const points = Math.max(8, computeMasteryPoints());
        const relatedSkills = (skills || []).filter((entry) =>
          entry.masteryLevels.some((level) =>
            level.unlockedExercises.some(
              (ref) => ref === directExercise.id || normalizeText(ref) === normalizeText(directExercise.name)
            )
          )
        );

        if (!relatedSkills.length) {
          toast.success('Exercise session completed. No linked skill was found to update.');
        } else {
          const perSkillPoints = Math.max(1, Math.round(points / relatedSkills.length));
          await Promise.all(relatedSkills.map((entry) => updateMastery({ skillId: entry.name, points: perSkillPoints })));
        }

        await logWorkout({
          sessionType: 'exercise',
          exerciseId: directExercise.id,
          sessionName: `${directExercise.name} Session`,
          durationActual: duration,
          notes: 'Exercise session completed via tracker',
          xpGained: points,
          exercises: performance,
        });
      }

      if (!options?.skipCompletionScreen) {
        setIsFinished(true);
      }
      toast.success('Session saved successfully.');
      return true;
    } catch (error) {
      console.error('Failed to finish session:', error);
      toast.error('Failed to save this session. Please try again.');
      return false;
    }
  };

  const nextExercise = async () => {
    if (!currentExerciseDone) {
      toast.error('Tick all sets for this exercise before continuing.');
      return;
    }

    if (currentExerciseIndex < plannedEntries.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setTimerActive(false);
      setTimeLeft(60);
      setActiveRestSet(null);
      setTimerPhase(null);
      setActiveSetIndex(null);
      return;
    }

    if (mode === 'exercise' && nextSuggestedExercise) {
      const saved = await finishSession({ skipCompletionScreen: true });
      if (saved) {
        toast.success(`Next suggestion: ${nextSuggestedExercise.name}`);
        router.push(`/dashboard/track/${nextSuggestedExercise.id}?mode=exercise`);
      }
      return;
    }

    await finishSession();
  };

  const handleFinishClick = async () => {
    if (!allDone) {
      toast.error('Complete all required sets before ending the session.');
      return;
    }
    await finishSession();
  };

  const prevExercise = () => {
    if (currentExerciseIndex === 0) return;
    setCurrentExerciseIndex((prev) => prev - 1);
    setTimerActive(false);
    setTimeLeft(60);
    setActiveRestSet(null);
    setTimerPhase(null);
    setActiveSetIndex(null);
  };

  const sessionName =
    mode === 'workout' ? workout?.name : mode === 'skill' ? `${skill?.name || 'Skill'} Mastery Session` : `${directExercise?.name || 'Exercise'} Session`;
  const backHref = mode === 'workout' ? '/dashboard/workouts' : mode === 'skill' ? `/dashboard/skills/${sessionId}` : `/dashboard/exercises/${sessionId}`;
  const valueLabel = currentPlan.duration ? 'Target Seconds' : 'Target Reps';
  const timerText = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  if (isFinished) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold">Session Complete</h1>
          <p className="text-soft">Great work, {user?.name?.split(' ')[0] || 'Athlete'}.</p>
        </div>
        <div className="grid w-full max-w-sm grid-cols-2 gap-4">
          <div className="app-surface p-4">
            <p className="text-sm text-soft">Duration</p>
            <p className="text-xl font-bold">{Math.max(1, Math.round((Date.now() - sessionStartTime.getTime()) / 60000))}m</p>
          </div>
          <div className="app-surface p-4">
            <p className="text-sm text-soft">Exercises</p>
            <p className="text-xl font-bold">{plannedEntries.length}</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 px-4 py-6 md:px-8 md:py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-1 transition-colors hover:border-border-strong"
          >
            <X className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-semibold">{sessionName}</h1>
            <p className="text-xs text-soft">{mode} session in progress</p>
          </div>
        </div>
        <button
          onClick={handleFinishClick}
          disabled={isSaving || !allDone}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : allDone ? 'Finish' : 'Finish (Locked)'}
        </button>
      </header>

      <div className="app-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-soft">
            <BookOpen className="h-4 w-4 text-primary" />
            Exercise Guide
          </div>
          <button
            onClick={() => setShowGuide((prev) => !prev)}
            className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-soft transition-colors hover:text-foreground"
          >
            {showGuide ? 'Hide' : 'Show'}
          </button>
        </div>

        {showGuide && (
          <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="overflow-hidden rounded-xl border border-border bg-black/20">
              {exerciseVideoUrl ? (
                <iframe
                  src={exerciseVideoUrl}
                  title={`${exercise?.name || 'Exercise'} demo`}
                  className="h-[240px] w-full md:h-[320px]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : exerciseImageUrl ? (
                <img
                  src={exerciseImageUrl}
                  alt={exercise?.name || 'Exercise preview'}
                  className="h-[240px] w-full object-cover md:h-[320px]"
                />
              ) : (
                <div className="flex h-[240px] w-full items-center justify-center md:h-[320px]">
                  <ImageIcon className="h-8 w-8 text-soft/50" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-soft">
                {exerciseVideoUrl ? <Video className="h-4 w-4 text-primary" /> : <ImageIcon className="h-4 w-4 text-primary" />}
                {exerciseVideoUrl ? 'Form video loaded' : 'Exercise image loaded'}
              </div>
              <h3 className="text-sm font-bold text-white">Key Instructions</h3>
              <div className="space-y-2">
                {(exercise?.instructions || []).slice(0, 3).map((instruction, idx) => (
                  <p key={idx} className="text-xs leading-relaxed text-soft">
                    {idx + 1}. {instruction}
                  </p>
                ))}
                {!exercise?.instructions?.length && <p className="text-xs text-soft">No instructions available yet.</p>}
              </div>
              <Link href={`/dashboard/exercises/${currentPlan.exerciseId}`} className="inline-flex text-xs font-semibold text-primary hover:underline">
                Open full exercise details
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="app-surface overflow-hidden">
        <div className={cn('border-b border-border p-5', visual?.panelClassName || 'bg-surface-2')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                {visual ? <visual.Icon className="h-6 w-6 text-primary" /> : <Dumbbell className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-soft">{exercise?.category || 'Exercise'}</p>
                <h2 className="text-xl font-bold">{exercise?.name || currentPlan.exerciseId}</h2>
              </div>
            </div>
            <p className="text-xs text-soft">
              {currentExerciseIndex + 1}/{plannedEntries.length}
            </p>
          </div>
          {!currentExerciseDone && (
            <button
              onClick={startExerciseFlow}
              disabled={timerPhase !== null}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground disabled:opacity-50"
            >
              <Timer className="h-3.5 w-3.5" />
              {timerPhase ? 'Flow Running...' : 'Start Exercise Flow'}
            </button>
          )}
        </div>

        <div className="space-y-4 p-5">
          {currentSets.map((set, index) => (
            <div
              key={index}
              className={cn(
                'rounded-xl border p-4',
                set.completed ? 'border-primary/30 bg-primary/5' : 'border-border-subtle bg-surface-2/40'
              )}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">Set {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdateValue(index, -1)} className="h-7 w-7 rounded-md border border-border bg-surface-2">
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{set.value}</span>
                    <button onClick={() => handleUpdateValue(index, 1)} className="h-7 w-7 rounded-md border border-border bg-surface-2">
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-soft">{valueLabel}</span>
                </div>

                <div className="flex items-center gap-3">
                  {timerActive && activeSetIndex === index && (
                    <div className="flex min-w-[210px] items-center justify-between rounded-2xl border border-primary/30 bg-surface-1 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Timer className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-mono text-3xl font-black tracking-tighter">{timerText}</div>
                          <p className="text-[10px] uppercase tracking-wider text-soft">
                            {timerPhase === 'work'
                              ? currentPlan.duration
                                ? `Set ${index + 1} Work`
                                : `Set ${index + 1} Rep Pace`
                              : `Set ${index + 1} Rest`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleToggleSet(index)}
                    disabled={timerPhase !== null}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                      set.completed ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface-3 text-soft',
                      timerPhase !== null && 'opacity-60'
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <button
              onClick={prevExercise}
              disabled={currentExerciseIndex === 0}
              className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {allDone && <span className="text-xs font-semibold text-emerald-400">All targets completed</span>}

            <button
              onClick={nextExercise}
              disabled={isSaving || !currentExerciseDone}
              className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isSaving
                ? 'Saving...'
                : currentExerciseIndex === plannedEntries.length - 1
                  ? mode === 'exercise' && nextSuggestedExercise
                    ? 'Next Suggestion'
                    : 'End Session'
                  : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {timerActive && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              setTimerActive(false);
              setTimerPhase(null);
              setActiveRestSet(null);
              setActiveSetIndex(null);
              setTimeLeft(60);
            }}
            className="rounded-full border border-border bg-surface-1 p-3 text-soft hover:text-foreground"
            title="Stop guided timer"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="app-surface w-full max-w-sm p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold">End Session?</h3>
            <p className="mb-6 text-sm text-soft">Your current progress in this tracker will not be saved if you leave now.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
              >
                Stay
              </button>
              <button
                onClick={() => router.push(backHref)}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                End anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
