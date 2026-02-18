'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, CirclePlay, Medal, Target, Zap } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';

import { useSkills, useUserMastery, useExercises } from '@/lib/hooks/useApi';
import { cn } from '@/lib/utils';

export default function SkillDetailPage() {
    const { id } = useParams<{ id: string }>();

    // API Hooks
    const { data: skills, isLoading: isSkillsLoading } = useSkills();
    const { data: mastery, isLoading: isMasteryLoading } = useUserMastery();
    const { data: exercises, isLoading: isExercisesLoading } = useExercises();

    const isLoading = isSkillsLoading || isMasteryLoading || isExercisesLoading;

    const skill = useMemo(() => skills?.find((s) => s.id === id || (s as { _id?: string })._id === id), [skills, id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!skill) {
        notFound();
    }

    const userMastery = mastery?.find((m) => m.skillId === skill.name);
    const currentLevel = userMastery?.currentLevel ?? 0;
    const currentPoints = userMastery?.currentPoints ?? 0;

    return (
        <div className="animate-fade-in space-y-6 pb-12">
            {/* Header */}
            <header className="app-surface p-6 md:p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    {/* Zap icon removed from imports, so removing its usage here */}
                    {/* <Zap className="h-40 w-40" /> */}
                </div>

                <Link
                    href="/dashboard/roadmap"
                    className="inline-flex items-center gap-2 text-xs font-bold text-soft hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Skill Mastery
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary bg-primary/10 px-2.5 py-1 rounded">Skill Protocol</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">{skill.category} Division</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white">{skill.name}</h1>
                        <p className="text-sm text-soft max-w-2xl leading-relaxed">
                            {skill.description}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="surface-muted px-6 py-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-soft mb-1">Current Mastery</p>
                            <p className="text-2xl font-black text-white">Lv. {currentLevel}</p>
                        </div>
                        <div className="surface-muted px-6 py-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-soft mb-1">Skill Points</p>
                            <p className="text-2xl font-black text-primary">{currentPoints} XP</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
                {/* Progression Timeline */}
                <section className="app-surface p-6 md:p-8">
                    <h2 className="text-xl font-black text-white tracking-tight mb-8 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Progression Roadshow
                    </h2>

                    <div className="relative space-y-12 pl-8 border-l-2 border-white/5 ml-4">
                        {skill.masteryLevels.map((lvl) => {
                            const isUnlocked = lvl.level <= currentLevel;
                            const isCurrent = lvl.level === currentLevel;

                            return (
                                <div key={lvl.level} className={cn(
                                    "relative transition-opacity duration-500",
                                    !isUnlocked && "opacity-40"
                                )}>
                                    {/* Link Dot */}
                                    <div className={cn(
                                        "absolute -left-[41px] top-0 h-4 w-4 rounded-full border-4 border-surface-1",
                                        isUnlocked ? "bg-primary shadow-[0_0_12px_rgba(232,197,39,0.5)]" : "bg-white/10"
                                    )} />

                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <p className={cn(
                                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                                isUnlocked ? "text-primary" : "text-soft/60"
                                            )}>
                                                Level {lvl.level}: {lvl.label}
                                                {isCurrent && <span className="ml-2 lowercase font-normal italic">(Currently Active)</span>}
                                            </p>
                                            <h3 className="text-lg font-black text-white mt-1">Unlocked Exercises</h3>
                                        </div>
                                        {lvl.pointsRequired > 0 && (
                                            <span className="text-[10px] font-bold text-soft/40 uppercase tracking-tighter">
                                                Requires {lvl.pointsRequired} Mastery Points
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {lvl.unlockedExercises.map((exId) => {
                                            const exercise = exercises?.find(e => e.id === exId);
                                            return (
                                                <Link
                                                    key={exId}
                                                    href={`/dashboard/exercises/${exId}`}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                                                        isUnlocked
                                                            ? "bg-surface-2/40 border-white/5 hover:border-primary/30 hover:bg-surface-2/60"
                                                            : "bg-surface-1/30 border-white/5 pointer-events-none"
                                                    )}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{exercise?.name || exId.replace('-', ' ')}</p>
                                                        <p className="text-[10px] text-soft/60 uppercase font-black tracking-tighter mt-0.5">{exercise?.level || 'Intermediate'}</p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-soft/20" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Sidebar: Skill Stats & Info */}
                <aside className="space-y-6">
                    <section className="app-surface p-6">
                        <Link
                            href={`/dashboard/track/${skill.id}?mode=skill`}
                            className="mb-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110"
                        >
                            <CirclePlay className="h-4 w-4" />
                            Start Skill Mastery Session
                        </Link>

                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                            <Medal className="h-4 w-4 text-primary" />
                            Skill Intelligence
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                                <span className="text-[10px] font-bold text-soft uppercase">Prerequisites</span>
                                <span className="text-[10px] font-black text-white uppercase">{skill.prerequisites?.join(', ') || 'None'}</span>
                            </div>
                            <div className="flex justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                                <span className="text-[10px] font-bold text-soft uppercase">Focus Area</span>
                                <span className="text-[10px] font-black text-white uppercase">{skill.category}</span>
                            </div>
                        </div>

                        <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                            <p className="text-[11px] font-bold text-primary mb-2 flex items-center gap-2">
                                <Zap className="h-3 w-3" />
                                Training Tip
                            </p>
                            <p className="text-[11px] text-soft leading-relaxed italic">
                                &quot;Mastery in {skill.name} requires consistent tension and shoulder stability. Ensure your {skill.prerequisites?.[0] || 'foundation'} is solid before progressing.&quot;
                            </p>
                        </div>
                    </section>

                    <section className="app-surface p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Mastery Contribution</h3>
                        <div className="relative h-48 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-32 w-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-white leading-none">{currentPoints}</p>
                                        <p className="text-[8px] font-black text-soft uppercase tracking-widest mt-1">XP Points</p>
                                    </div>
                                </div>
                                <svg className="absolute h-40 w-40 -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="64"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-primary/20"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="64"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        {...(() => {
                                            const maxPoints = skill.masteryLevels[skill.masteryLevels.length - 1]?.pointsRequired || 1000;
                                            const dashArray = (currentPoints / maxPoints) * 402;
                                            return { strokeDasharray: `${dashArray} 402` };
                                        })()}
                                        className="text-primary"
                                    />
                                </svg>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
