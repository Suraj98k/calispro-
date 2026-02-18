'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';

import { useExercises } from '@/lib/hooks/useApi';
import { getExerciseVisual } from '@/lib/exerciseVisuals';

const categoryFilters = ['All', 'Push', 'Pull', 'Core', 'Legs', 'Full Body', 'Balance', 'Static'] as const;
const levelFilters = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

export default function ExercisesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>('All');
  const [level, setLevel] = useState<(typeof levelFilters)[number]>('All');

  const { data: exercises, isLoading } = useExercises();

  const filtered = useMemo(
    () => {
      if (!exercises) return [];
      return exercises.filter((exercise) => {
        const matchesQuery =
          exercise.name.toLowerCase().includes(query.toLowerCase()) ||
          exercise.description.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'All' || exercise.category === category;
        const matchesLevel = level === 'All' || exercise.level === level;
        return matchesQuery && matchesCategory && matchesLevel;
      });
    },
    [exercises, category, level, query]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="animate-fade-in space-y-5">
      <header className="app-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-soft">Exercise Library</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight">Build your progression stack</h1>
            <p className="mt-1.5 text-sm text-soft">Browse movements by category and level.</p>
          </div>
          <div className="surface-muted px-4 py-2.5 text-right">
            <p className="text-[11px] uppercase tracking-wide text-soft">Results</p>
            <p className="mt-0.5 text-xl font-semibold">{filtered.length}</p>
          </div>
        </div>

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-soft focus:border-primary/40"
          />
        </label>
      </header>

      <section className="app-surface p-5">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-soft">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {categoryFilters.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`pill ${category === item ? 'pill-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-[11px] uppercase tracking-widest text-soft">Level</p>
        <div className="flex flex-wrap gap-1.5">
          {levelFilters.map((item) => (
            <button key={item} onClick={() => setLevel(item)} className={`pill ${level === item ? 'pill-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exercise) => {
          const visual = getExerciseVisual(exercise.category);
          return (
            <Link
              key={exercise.id}
              href={`/dashboard/exercises/${exercise.id}`}
              className="app-surface block p-4 transition-all hover:border-border-strong hover-lift"
            >
              <div className={`relative h-28 overflow-hidden rounded-lg border border-border-subtle ${visual.panelClassName}`}>
                {exercise.imageUrl && (
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-2 right-2 rounded-md border border-white/10 bg-black/20 p-1.5">
                  <visual.Icon className="h-5 w-5 text-white/70" />
                </div>
                <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${visual.badgeClassName}`}>
                  {exercise.category}
                </span>
              </div>
              <p className="mt-3 font-semibold">{exercise.name}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-soft">{exercise.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="rounded-full bg-surface-3 px-2.5 py-1 text-soft">{exercise.level}</span>
                <span className="flex items-center gap-1 text-primary">
                  <Star className="h-3 w-3 fill-current" />
                  4.9
                </span>
              </div>
            </Link>
          );
        })}
        {!filtered.length && (
          <div className="app-surface col-span-full p-10 text-center">
            <p className="text-lg font-semibold">No exercises found</p>
            <p className="mt-1 text-sm text-soft">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </section>
  );
}
