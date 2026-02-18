'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Wifi, ChevronRight, CircleUser, LogOut, Play } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useExercises, useSkills, useUserMastery, useWorkoutHistory, useWorkouts } from '@/lib/hooks/useApi';
import { getTodayPlanDay, loadPlanner, sortByPriority } from '@/lib/planner';

export function DashboardHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const { data: workouts } = useWorkouts();
    const { data: skills } = useSkills();
    const { data: exercises } = useExercises();
    const { data: mastery } = useUserMastery();
    const { data: history } = useWorkoutHistory(50);
    const [time, setTime] = useState(new Date());

    const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

    const todaySummary = React.useMemo(() => {
        const allHistory = history || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySessions = allHistory.filter((entry) => {
            const date = new Date(entry.date);
            date.setHours(0, 0, 0, 0);
            return date.getTime() === today.getTime();
        });

        const completedWorkoutIds = new Set(
            todaySessions
                .filter((entry) => (entry.sessionType || 'workout') === 'workout' && entry.workoutId)
                .map((entry) => entry.workoutId as string)
        );
        const completedSkillIds = new Set(
            todaySessions
                .filter((entry) => (entry.sessionType || 'workout') === 'skill' && entry.skillId)
                .map((entry) => entry.skillId as string)
        );
        const completedExerciseIds = new Set(
            todaySessions
                .filter((entry) => (entry.sessionType || 'workout') === 'exercise' && entry.exerciseId)
                .map((entry) => entry.exerciseId as string)
        );

        return { completedWorkoutIds, completedSkillIds, completedExerciseIds };
    }, [history]);

    const quickStartHref = React.useMemo(() => {
        const planner = loadPlanner();
        const todayPlan = getTodayPlanDay(planner);

        if (planner.activePlan && todayPlan?.items.length) {
            const currentPlanItem = sortByPriority(todayPlan.items).find((item) => {
                if (item.type === 'workout') return !todaySummary.completedWorkoutIds.has(item.refId);
                if (item.type === 'skill') {
                    const skillName =
                        skills?.find((entry) => entry.id === item.refId || (entry as { _id?: string })._id === item.refId)?.name || item.name;
                    return !todaySummary.completedSkillIds.has(skillName);
                }
                return !todaySummary.completedExerciseIds.has(item.refId);
            });

            if (currentPlanItem) {
                if (currentPlanItem.type === 'workout') return `/dashboard/track/${currentPlanItem.refId}?mode=workout`;
                if (currentPlanItem.type === 'skill') return `/dashboard/track/${currentPlanItem.refId}?mode=skill`;
                return `/dashboard/track/${currentPlanItem.refId}?mode=exercise`;
            }
        }

        const pendingWorkouts = (workouts || []).filter((entry) => !todaySummary.completedWorkoutIds.has(entry.id));
        const activeWorkout = pendingWorkouts.find((entry) => entry.isRecommended) || pendingWorkouts[0];
        if (activeWorkout) return `/dashboard/track/${activeWorkout.id}?mode=workout`;

        if (skills?.length && exercises?.length) {
            const scored = skills.map((skill) => {
                const userState = mastery?.find((item) => item.skillId === skill.name);
                return {
                    skill,
                    score: (userState?.currentLevel || 0) * 10000 + (userState?.currentPoints || 0),
                };
            });
            scored.sort((a, b) => a.score - b.score);
            const focusSkill = scored[0]?.skill;

            if (focusSkill) {
                const skillId = focusSkill.id || (focusSkill as { _id?: string })._id;
                if (skillId && !todaySummary.completedSkillIds.has(focusSkill.name)) {
                    return `/dashboard/track/${skillId}?mode=skill`;
                }

                const masteryState = mastery?.find((entry) => entry.skillId === focusSkill.name);
                const level = masteryState?.currentLevel ?? 0;
                const levelData = focusSkill.masteryLevels.find((entry) => entry.level === level) || focusSkill.masteryLevels[0];
                const candidates = levelData?.unlockedExercises || [];

                const exercise =
                    candidates
                        .map((ref) => exercises.find((entry) => entry.id === ref || normalizeText(entry.name) === normalizeText(ref)))
                        .find(Boolean) ||
                    exercises.find((entry) => entry.category === focusSkill.category);

                if (exercise && !todaySummary.completedExerciseIds.has(exercise.id)) {
                    return `/dashboard/track/${exercise.id}?mode=exercise`;
                }
            }
        }

        return '/dashboard/planning';
    }, [todaySummary, workouts, skills, exercises, mastery]);

    const handleQuickStart = () => {
        router.push(quickStartHref);
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const pathSegments = pathname.split('/').filter(Boolean);

    const getTacticalLabel = (path: string) => {
        const mapping: Record<string, string> = {
            'dashboard': 'Command Center',
            'planning': 'Planning Board',
            'exercises': 'Library',
            'workouts': 'Protocols',
            'skills': 'Skill Matrix',
            'roadmap': 'Skill Mastery',
            'history': 'Archive',
            'profile': 'Operator ID',
            'track': 'Field Execution'
        };
        return mapping[path] || path.charAt(0).toUpperCase() + path.slice(1);
    };

    if (pathname.startsWith('/dashboard/track')) return null;

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-2">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(232,197,39,0.5)]" />
                </div>

                <nav className="flex items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                    {pathSegments.map((segment, index) => {
                        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathSegments.length - 1;
                        const label = getTacticalLabel(segment);

                        return (
                            <React.Fragment key={href}>
                                {index > 0 && <ChevronRight className="mx-2 h-3 w-3 text-white/20" />}
                                {isLast ? (
                                    <span className="text-white">{label}</span>
                                ) : (
                                    <Link href={href} className="hover:text-primary transition-colors">
                                        {label}
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden items-center gap-4 md:flex">
                    <button
                        onClick={handleQuickStart}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
                    >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Quick Start
                    </button>

                    <div className="flex items-center gap-2 text-soft/40 mr-4">
                        <Wifi className="h-3 w-3" />
                        <span className="text-[10px] font-bold tracking-widest">SIGNAL_LOCKED</span>
                    </div>
                    <p className="text-xs font-black text-white tabular-nums tracking-widest border border-white/5 bg-black/20 px-3 py-1 rounded-md">
                        {formattedTime}
                    </p>
                    <div className="h-6 w-[1px] bg-border/50 mx-2" />
                </div>

                <div className="flex items-center gap-2">
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/20 text-soft transition-all hover:bg-surface-2 hover:text-white group">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                    </button>

                    <button
                        onClick={logout}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/20 text-soft transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>

                    <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/20 text-soft transition-all hover:bg-surface-2 hover:text-white hover:border-primary/30">
                        <CircleUser className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
