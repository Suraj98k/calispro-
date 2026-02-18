'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CirclePlay, Clock3 } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import React from 'react';

import { useWorkoutById, useExercises } from '@/lib/hooks/useApi';
import { getWorkoutImageUrl } from '@/lib/workoutImages';

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: workout, isLoading: isWorkoutLoading } = useWorkoutById(id);
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();

  if (isWorkoutLoading || isExercisesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workout) {
    notFound();
  }

  return (
    <section className="animate-fade-in space-y-5">
      <header className="app-surface p-5">
        <Link href="/dashboard/workouts" className="inline-flex items-center gap-1.5 text-xs text-soft transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to workouts
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{workout.name}</h1>
        <p className="mt-1.5 text-sm text-soft">{workout.description}</p>
        <div className="relative mt-4 h-48 overflow-hidden rounded-xl border border-border-subtle bg-surface-2">
          <Image src={getWorkoutImageUrl(workout)} alt={workout.name} fill className="object-cover" sizes="100vw" />
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1.5 text-xs text-soft">
          <Clock3 className="h-3.5 w-3.5" />
          Estimated {workout.durationEstimate} minutes
        </div>
      </header>

      <section className="app-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Exercise sequence</h2>
          <span className="pill">{workout.level}</span>
        </div>
        <div className="mt-4 space-y-2">
          {workout.exercises.map((entry, idx) => {
            const exercise = exercises?.find((item) => item.id === entry.exerciseId);
            if (!exercise) return null;

            return (
              <Link
                key={`${entry.exerciseId}-${idx}`}
                href={`/dashboard/exercises/${exercise.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-4 transition-all hover:border-border-strong"
              >
                <div>
                  <p className="text-sm font-medium">{exercise.name}</p>
                  <p className="mt-0.5 text-[11px] text-soft">
                    {entry.sets ? `${entry.sets} sets` : ''}
                    {entry.reps ? ` x ${entry.reps} reps` : ''}
                    {entry.duration ? ` x ${entry.duration}s` : ''}
                  </p>
                </div>
                <span className="text-xs font-medium text-primary">Open</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="app-surface p-5">
        <Link
          href={`/dashboard/track/${workout.id}?mode=workout`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
        >
          <CirclePlay className="h-4 w-4" />
          Start workout session
        </Link>
      </div>
    </section>
  );
}
