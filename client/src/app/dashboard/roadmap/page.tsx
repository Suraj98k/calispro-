'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Play, Sparkles, Target } from 'lucide-react';

import { useExercises, useSkills, useUserMastery } from '@/lib/hooks/useApi';
import { cn } from '@/lib/utils';
import type { Exercise, Skill } from '@/types';

type SkillTrack = {
  key: string;
  name: string;
  description: string;
  category: Skill['category'];
  phases: string[];
  recommendedStart: string;
};

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const TRACKS: SkillTrack[] = [
  {
    key: 'muscle-up',
    name: 'Muscle Up',
    description: 'Build explosive pull and transition control for a strict bar muscle up.',
    category: 'Pull',
    phases: ['Australian Pull Up', 'Pull Up', 'Dip', 'Muscle Up'],
    recommendedStart: 'Pull Up',
  },
  {
    key: 'handstand',
    name: 'Handstand',
    description: 'Develop overhead balance, shoulder stacking, and freestanding control.',
    category: 'Balance',
    phases: ['Pike Push Up', 'Handstand Hold (Wall)', 'Crow Pose', 'Free Handstand'],
    recommendedStart: 'Handstand Hold (Wall)',
  },
  {
    key: 'planche',
    name: 'Planche',
    description: 'Progress from straight-arm strength to advanced static pushing.',
    category: 'Static',
    phases: ['Planche Lean', 'Pseudo Planche Push Up', 'Tuck Planche', 'Adv. Tuck Planche'],
    recommendedStart: 'Planche Lean',
  },
  {
    key: 'front-lever',
    name: 'Front Lever',
    description: 'Develop horizontal pulling strength and posterior-chain body control.',
    category: 'Static',
    phases: ['Hollow Body Hold', 'Pull Up', 'Front Lever (Tuck)', 'Adv. Tuck Front Lever'],
    recommendedStart: 'Front Lever (Tuck)',
  },
];

const findExerciseByRef = (allExercises: Exercise[] | undefined, ref: string) => {
  if (!allExercises?.length) return undefined;
  return allExercises.find((entry) => entry.id === ref || normalizeText(entry.name) === normalizeText(ref));
};

export default function SkillRoadmapPage() {
  const { data: skills, isLoading: isSkillsLoading } = useSkills();
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();
  const { data: mastery, isLoading: isMasteryLoading } = useUserMastery();

  const isLoading = isSkillsLoading || isMasteryLoading || isExercisesLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const liveSkills = skills || [];
  const tracks = TRACKS.map((track) => {
    const linkedSkill =
      liveSkills.find((entry) => normalizeText(entry.name) === normalizeText(track.name)) ||
      liveSkills.find((entry) => normalizeText(entry.name).includes(normalizeText(track.name)));

    const masteryState = linkedSkill ? mastery?.find((entry) => entry.skillId === linkedSkill.name) : undefined;
    const currentLevel = masteryState?.currentLevel ?? 0;
    const currentPoints = masteryState?.currentPoints ?? 0;
    const nextLevel = linkedSkill?.masteryLevels.find((entry) => entry.level === currentLevel + 1);
    const nextTarget = nextLevel?.pointsRequired ?? Math.max(currentPoints, 100);

    const phaseExercises = track.phases.map((phase) => findExerciseByRef(exercises, phase)).filter(Boolean) as Exercise[];
    const recommendedExercise =
      findExerciseByRef(exercises, track.recommendedStart) ||
      phaseExercises[0] ||
      exercises?.find((entry) => entry.category === track.category);

    const sessionHref =
      linkedSkill && (linkedSkill.id || (linkedSkill as { _id?: string })._id)
        ? `/dashboard/track/${linkedSkill.id || (linkedSkill as { _id?: string })._id}?mode=skill`
        : recommendedExercise
          ? `/dashboard/track/${recommendedExercise.id}?mode=exercise`
          : '/dashboard/exercises';

    const detailsHref =
      linkedSkill && (linkedSkill.id || (linkedSkill as { _id?: string })._id)
        ? `/dashboard/skills/${linkedSkill.id || (linkedSkill as { _id?: string })._id}`
        : recommendedExercise
          ? `/dashboard/exercises/${recommendedExercise.id}`
          : '/dashboard/exercises';

    const progress = Math.min(100, nextTarget > 0 ? (currentPoints / nextTarget) * 100 : 0);
    const phaseDoneCount = Math.min(track.phases.length, Math.max(0, currentLevel + 1));

    return {
      ...track,
      linkedSkill,
      currentLevel,
      currentPoints,
      nextTarget,
      progress,
      phaseDoneCount,
      sessionHref,
      detailsHref,
      phaseExercises,
    };
  });

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <header className="app-surface p-6 md:p-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-soft transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="rounded bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-primary">Skill Mastery</span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Calisthenics Tracks</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">Skill Mastery</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-soft">
            Follow simple calisthenics skill tracks built from exercises. Start a session, level up, and continue to your next phase.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {tracks.map((track) => (
          <article key={track.key} className="app-surface p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">{track.name}</h2>
                <p className="mt-1 text-xs text-soft">{track.description}</p>
              </div>
              <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                Lv {track.currentLevel}
              </span>
            </div>

            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-soft">Progress to next level</span>
                <span className="text-white">
                  {track.currentPoints}/{track.nextTarget}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/30">
                <div className="h-full bg-primary transition-all" style={{ width: `${track.progress}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              {track.phases.map((phase, index) => {
                const done = index < track.phaseDoneCount;
                return (
                  <div
                    key={phase}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2 text-xs',
                      done ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-border bg-surface-2 text-soft'
                    )}
                  >
                    <span className="font-medium">{phase}</span>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Link
                href={track.sessionHref}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start Session
              </Link>
              <Link href={track.detailsHref} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Continue Path
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {!track.linkedSkill && (
              <p className="mt-3 text-[11px] text-soft">
                <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
                Skill is running in exercise mode until a dedicated backend skill record is available.
              </p>
            )}
          </article>
        ))}
      </section>

      <footer className="app-surface flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-xs text-soft">Every track session updates your history and contributes to progressive mastery work.</p>
        <Link href="/dashboard/history" className="text-xs font-semibold text-primary hover:underline">
          View session history
        </Link>
      </footer>
    </div>
  );
}
