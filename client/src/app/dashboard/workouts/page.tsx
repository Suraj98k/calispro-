'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Clock3, Dumbbell, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateWorkout, useExercises, useWorkouts } from '@/lib/hooks/useApi';
import { getWorkoutImageUrl } from '@/lib/workoutImages';

type DraftExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  mode: 'reps' | 'duration';
  target: number;
};

const createDraftExercise = (): DraftExercise => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: '',
  sets: 3,
  mode: 'reps',
  target: 10,
});

export default function WorkoutsPage() {
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();
  const { mutateAsync: createWorkout, isPending: isCreatingWorkout } = useCreateWorkout();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [durationEstimate, setDurationEstimate] = useState(30);
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([createDraftExercise()]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  if (isWorkoutsLoading || isExercisesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const workoutsList = workouts || [];
  const customCount = workoutsList.filter((item) => item.isGlobal === false).length;

  const setDraft = (id: string, updater: (prev: DraftExercise) => DraftExercise) => {
    setDraftExercises((prev) => prev.map((entry) => (entry.id === id ? updater(entry) : entry)));
  };

  const handleCreateWorkout = async () => {
    if (!name.trim()) {
      toast.error('Workout name is required.');
      return;
    }

    const selectedRows = draftExercises.filter((entry) => entry.exerciseId);
    if (!selectedRows.length) {
      toast.error('Select at least one exercise.');
      return;
    }

    try {
      await createWorkout({
        name: name.trim(),
        description: description.trim() || 'Custom workout',
        imageUrl: imageUrl.trim() || undefined,
        level,
        durationEstimate: Math.max(5, durationEstimate),
        exercises: selectedRows.map((entry) => ({
          exerciseId: entry.exerciseId,
          sets: Math.max(1, entry.sets),
          reps: entry.mode === 'reps' ? Math.max(1, entry.target) : undefined,
          duration: entry.mode === 'duration' ? Math.max(5, entry.target) : undefined,
        })),
      });

      toast.success('Workout created.');
      setName('');
      setDescription('');
      setImageUrl('');
      setLevel('Beginner');
      setDurationEstimate(30);
      setDraftExercises([createDraftExercise()]);
      setIsBuilderOpen(false);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to create workout.';
      toast.error(message);
    }
  };

  return (
    <section className="animate-fade-in space-y-5">
      <header className="app-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-soft">Workout plans</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight">Choose your training routine</h1>
            <p className="mt-1.5 text-sm text-soft">Structured plans based on your level and weekly capacity.</p>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-primary">
              Custom workouts created: {customCount}
            </p>
          </div>
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground">
                <Plus className="h-3.5 w-3.5" />
                Create workout
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl p-0" showCloseButton>
              <div className="max-h-[85vh] overflow-y-auto p-5 md:p-6">
                <DialogHeader>
                  <DialogTitle>Create Custom Workout</DialogTitle>
                  <DialogDescription>Build your own protocol using available exercises.</DialogDescription>
                </DialogHeader>

                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Workout name"
                      className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-primary/40"
                    />
                    <input
                      type="number"
                      min={5}
                      value={durationEstimate}
                      onChange={(e) => setDurationEstimate(Number(e.target.value))}
                      placeholder="Duration (minutes)"
                      className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-primary/40"
                    />
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Workout description"
                    className="min-h-20 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-primary/40"
                  />
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Workout image URL (optional)"
                    className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-primary/40"
                  />

                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
                    className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm md:w-64"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <div className="space-y-3">
                    {draftExercises.map((row) => (
                      <div key={row.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <select
                            value={row.exerciseId}
                            onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, exerciseId: e.target.value }))}
                            className="h-9 rounded border border-border bg-surface-2 px-2 text-xs"
                          >
                            <option value="">Select exercise</option>
                            {(exercises || []).map((entry) => (
                              <option key={entry.id} value={entry.id}>
                                {entry.name}
                              </option>
                            ))}
                          </select>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              min={1}
                              value={row.sets}
                              onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, sets: Number(e.target.value) }))}
                              className="h-9 rounded border border-border bg-surface-2 px-2 text-xs"
                              placeholder="Sets"
                            />
                            <select
                              value={row.mode}
                              onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, mode: e.target.value as 'reps' | 'duration' }))}
                              className="h-9 rounded border border-border bg-surface-2 px-2 text-xs"
                            >
                              <option value="reps">Reps</option>
                              <option value="duration">Secs</option>
                            </select>
                            <input
                              type="number"
                              min={1}
                              value={row.target}
                              onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, target: Number(e.target.value) }))}
                              className="h-9 rounded border border-border bg-surface-2 px-2 text-xs"
                              placeholder="Target"
                            />
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => setDraftExercises((prev) => prev.filter((entry) => entry.id !== row.id))}
                            disabled={draftExercises.length === 1}
                            className="inline-flex items-center gap-1 text-[11px] text-red-400 disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setDraftExercises((prev) => [...prev, createDraftExercise()])}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add exercise
                    </button>
                    <button
                      onClick={handleCreateWorkout}
                      disabled={isCreatingWorkout}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground disabled:opacity-50"
                    >
                      {isCreatingWorkout ? 'Saving...' : 'Create workout'}
                    </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workoutsList.map((workout) => (
          <Link
            key={workout.id}
            href={`/dashboard/workouts/${workout.id}`}
            className="app-surface block p-5 transition-all hover:border-border-strong hover-lift"
          >
            <div className="relative mb-4 h-24 overflow-hidden rounded-lg border border-border-subtle bg-linear-to-br from-surface-2 to-surface-1">
              <Image
                src={getWorkoutImageUrl(workout)}
                alt={workout.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <h2 className="text-lg font-semibold">{workout.name}</h2>
            <p className="mt-1.5 text-sm text-soft">{workout.description}</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-soft">
                <Dumbbell className="h-3 w-3" />
                {workout.level}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-soft">
                <Clock3 className="h-3 w-3" />
                {workout.durationEstimate} min
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-medium">
              <Link
                href={`/dashboard/track/${workout.id}?mode=workout`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                Track session
              </Link>
              <div className="flex items-center text-soft">
                Open plan
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </section>
    </section>
  );
}
