'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, AlertCircle, Target, Activity, Lightbulb, CirclePlay } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import React from 'react';
import { motion } from 'framer-motion';

import { getExerciseVisual } from '@/lib/exerciseVisuals';
import { useExerciseById, useExercises } from '@/lib/hooks/useApi';
import type { Exercise } from '@/types';
import { cn } from '@/lib/utils';

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

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: exercise, isLoading: isExerciseLoading } = useExerciseById(id);
  const { data: allExercises, isLoading: isAllExercisesLoading } = useExercises();

  if (isExerciseLoading || isAllExercisesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exercise) {
    notFound();
  }

  const easierLinks =
    exercise.progressions?.easier
      ?.map((progId) => allExercises?.find((entry) => entry.id === progId))
      .filter(Boolean) ?? [];
  const harderLinks =
    exercise.progressions?.harder
      ?.map((progId) => allExercises?.find((entry) => entry.id === progId))
      .filter(Boolean) ?? [];
  const visual = getExerciseVisual(exercise.category);
  const exerciseVideoUrl = getYouTubeEmbedUrl(exercise.videoUrl);
  const exerciseImageUrl = exercise.imageUrl || exerciseFallbackImages[exercise.category];

  return (
    <section className="animate-fade-in space-y-5 pb-20">
      <header className="app-surface p-5">
        <Link href="/dashboard/exercises" className="inline-flex items-center gap-1.5 text-xs text-soft transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to exercises
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`inline-flex rounded-lg border border-white/10 p-2 ${visual.panelClassName}`}
            >
              <visual.Icon className="h-4 w-4 text-white/80" />
            </motion.span>
            <h1 className="text-2xl font-black tracking-tight text-white">{exercise.name}</h1>
          </div>
          <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", visual.badgeClassName)}>
            {exercise.category}
          </div>
        </div>
        <p className="mt-2 text-sm text-soft max-w-2xl">{exercise.description}</p>
        <Link
          href={`/dashboard/track/${exercise.id}?mode=exercise`}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110"
        >
          <CirclePlay className="h-4 w-4" />
          Start exercise session
        </Link>
      </header>

      {/* Technique & Execution Protocol - Replaces Video Section */}
      <section className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <article className="app-surface p-6 shadow-xl shadow-primary/[0.02]">
          <div className="flex items-center gap-3 mb-6">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 bg-black/20 ${visual.panelClassName}`}>
              <visual.Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none">Execution Technique</h2>
              <p className="text-[10px] uppercase font-bold text-soft mt-1.5 tracking-widest">Protocol Instructions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-black/20">
              {exerciseVideoUrl ? (
                <iframe
                  src={exerciseVideoUrl}
                  title={`${exercise.name} demo`}
                  className="h-[240px] w-full md:h-[320px]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img src={exerciseImageUrl} alt={exercise.name} className="h-[240px] w-full object-cover md:h-[320px]" />
              )}
            </div>

            {exercise.instructions.map((instruction, idx) => (
              <div key={idx} className="group relative flex gap-5 p-5 rounded-2xl border border-border-subtle bg-surface-2/30 transition-all hover:border-primary/20 hover:bg-surface-2/50">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-xs font-black text-primary transition-transform group-hover:scale-110">
                  {idx + 1}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium leading-relaxed text-white/90 group-hover:text-white transition-colors">{instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-5">
          {/* Muscle Targets */}
          <section className="app-surface p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-5 flex items-center gap-2">
              <Target className="h-3 w-3" />
              Muscle Activation
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-soft uppercase mb-2">Primary Drivers</p>
                <div className="flex flex-wrap gap-2">
                  {exercise.primaryMuscles.map(muscle => (
                    <span key={muscle} className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
              {exercise.secondaryMuscles.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-soft uppercase mb-2">Secondary Support</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.secondaryMuscles.map(muscle => (
                      <span key={muscle} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-soft">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Coach HUD - Tips & Faults */}
          <section className="app-surface p-6 border-l-2 border-amber-500/30">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              Coach&apos;s HUD
            </h3>

            <div className="space-y-6">
              {/* Form Tips */}
              <div className="space-y-3">
                {exercise.formTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/80 leading-relaxed italic">&quot;{tip}&quot;</p>
                  </div>
                ))}
              </div>

              {/* Common Mistakes */}
              {exercise.commonMistakes.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <p className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle className="h-2.5 w-2.5" />
                    Technical Faults to Avoid
                  </p>
                  <ul className="space-y-2">
                    {exercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="text-xs text-soft flex gap-2 items-start">
                        <span className="h-1 w-1 rounded-full bg-red-400/50 mt-1.5 flex-shrink-0" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Progressions */}
          <section className="app-surface p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <Activity className="h-3 w-3 text-blue-400" />
              System Roadmap
            </h3>
            <div className="space-y-2">
              {easierLinks.map((item) => (
                <Link
                  key={item?.id}
                  href={`/dashboard/exercises/${item?.id}`}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-2/40 px-4 py-3.5 text-sm transition-all hover:border-border-strong hover:bg-surface-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
                    <span className="text-xs font-bold text-white"><span className="text-soft font-normal">Easier:</span> {item?.name}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-soft" />
                </Link>
              ))}
              {harderLinks.map((item) => (
                <Link
                  key={item?.id}
                  href={`/dashboard/exercises/${item?.id}`}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-2/40 px-4 py-3.5 text-sm transition-all hover:border-border-strong hover:bg-surface-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50" />
                    <span className="text-xs font-bold text-white"><span className="text-soft font-normal">Harder:</span> {item?.name}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-soft" />
                </Link>
              ))}
              {(!easierLinks.length && !harderLinks.length) && (
                <p className="text-[10px] text-soft italic text-center py-2 text-balance leading-relaxed">No alternate protocols detected. High-level mastery required.</p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
