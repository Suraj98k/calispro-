'use client';

import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, History, Trash2, Zap } from 'lucide-react';

import { useDeleteAllHistory, useDeleteHistoryEntry, useExercises, useSkills, useWorkoutHistory, useWorkouts } from '@/lib/hooks/useApi';

export default function HistoryPage() {
    const { data: rawHistory, isLoading: isHistoryLoading } = useWorkoutHistory(50);
    const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
    const { data: skills, isLoading: isSkillsLoading } = useSkills();
    const { data: exercises, isLoading: isExercisesLoading } = useExercises();
    const { mutateAsync: deleteHistoryEntry, isPending: isDeletingEntry } = useDeleteHistoryEntry();
    const { mutateAsync: deleteAllHistory, isPending: isDeletingAll } = useDeleteAllHistory();

    const history = useMemo(() => {
        if (!rawHistory) return [];
        return [...rawHistory].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [rawHistory]);

    const totalSessions = history.length;
    const totalMinutes = history.reduce((acc, curr) => acc + (curr.durationActual || 0), 0);
    const totalXP = history.reduce((acc, curr) => acc + (curr.xpGained || 0), 0);

    const onDeleteEntry = async (id: string) => {
        const ok = window.confirm('Delete this history entry? This cannot be undone.');
        if (!ok) return;

        try {
            await deleteHistoryEntry(id);
            toast.success('History entry deleted.');
        } catch {
            toast.error('Failed to delete history entry.');
        }
    };

    const onDeleteAll = async () => {
        const ok = window.confirm('Delete all training history? This cannot be undone.');
        if (!ok) return;

        try {
            await deleteAllHistory();
            toast.success('All history deleted.');
        } catch {
            toast.error('Failed to delete all history.');
        }
    };

    if (isHistoryLoading || isWorkoutsLoading || isSkillsLoading || isExercisesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Header / Summary */}
            <header className="app-surface p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <History className="h-40 w-40" />
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary bg-primary/10 px-2.5 py-1 rounded">Activity Log</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Mission History</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white">Training Archive</h1>
                        <p className="text-sm text-soft max-w-2xl leading-relaxed">
                            Review your past protocols and performance metrics. Consistency is the primary vector for progression.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="surface-muted px-6 py-4 rounded-2xl border border-white/5 whitespace-nowrap">
                            <p className="text-[10px] font-black uppercase tracking-widest text-soft mb-1 text-center">Sessions</p>
                            <p className="text-2xl font-black text-white text-center">{totalSessions}</p>
                        </div>
                        <div className="surface-muted px-6 py-4 rounded-2xl border border-white/5 whitespace-nowrap">
                            <p className="text-[10px] font-black uppercase tracking-widest text-soft mb-1 text-center">Active Time</p>
                            <p className="text-2xl font-black text-white text-center">{totalMinutes}m</p>
                        </div>
                        <div className="surface-muted px-6 py-4 rounded-2xl border border-white/5 whitespace-nowrap">
                            <p className="text-[10px] font-black uppercase tracking-widest text-soft mb-1 text-center">XP Earned</p>
                            <p className="text-2xl font-black text-primary text-center">+{totalXP}</p>
                        </div>
                        <button
                            onClick={onDeleteAll}
                            disabled={!history.length || isDeletingAll || isDeletingEntry}
                            className="px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isDeletingAll ? 'Deleting...' : 'Delete All'}
                        </button>
                    </div>
                </div>
            </header>

            {/* History List */}
            <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-white/60 px-2">Recent Deployments</h2>

                {history.length > 0 ? (
                    <div className="grid gap-3">
                        {history.map((session) => {
                            const sessionType = session.sessionType || 'workout';
                            const workout = workouts?.find(w => w.id === session.workoutId);
                            const skill = skills?.find(s => s.name === session.skillId || s.id === session.skillId);
                            const exercise = exercises?.find(e => e.id === session.exerciseId);
                            const dateFormatted = new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric'
                            }).format(new Date(session.date));
                            const sessionTitle =
                                session.sessionName ||
                                (sessionType === 'workout' && workout?.name) ||
                                (sessionType === 'skill' && (skill?.name || session.skillId)) ||
                                (sessionType === 'exercise' && (exercise?.name || session.exerciseId)) ||
                                'Training Session';
                            const sessionBadge = sessionType.toUpperCase();

                            return (
                                <div
                                    key={session.id}
                                    className="app-surface p-5 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-6 group hover:border-white/20 transition-all"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-primary shadow-lg group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <Zap className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white tracking-tight">{sessionTitle}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-soft uppercase tracking-tighter">
                                                    <Calendar className="h-3 w-3" />
                                                    {dateFormatted}
                                                </div>
                                                <div className="h-3 w-[1px] bg-white/10" />
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-soft uppercase tracking-tighter">
                                                    <Clock className="h-3 w-3" />
                                                    {session.durationActual} Minutes
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            COMPLETED
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                            {sessionBadge}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={() => onDeleteEntry(session.id)}
                                            disabled={isDeletingAll || isDeletingEntry}
                                            className="h-10 w-10 rounded-xl border border-red-500/20 bg-red-500/10 flex items-center justify-center text-red-300 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                            title="Delete entry"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="app-surface p-20 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-black/40 border border-white/5 flex items-center justify-center mx-auto text-soft/20">
                            <History className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white">No Archive Found</p>
                            <p className="text-xs text-soft">Your training deployments will be logged here once completed.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
