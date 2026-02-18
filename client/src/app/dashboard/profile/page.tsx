'use client';

import Link from 'next/link';
import { useState, type ComponentType } from 'react';
import { Calendar, Clock3, Flame, LogOut, Sparkles, Target } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useStreakStats, useWorkoutHistory } from '@/lib/hooks/useApi';

const dateLabel = (value?: string) => {
  if (!value) return 'No sessions yet';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No sessions yet';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ProfilePage() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { data: history, isLoading: isHistoryLoading } = useWorkoutHistory(100);
  const { data: streakStats, isLoading: isStreakLoading } = useStreakStats();
  const [renderTimeMs] = useState(() => Date.now());

  if (isAuthLoading || isHistoryLoading || isStreakLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const profile = user || { name: 'User', level: 'Beginner', email: 'user@calispro.ai' };
  const sessions = history || [];
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, item) => sum + (item.durationActual || 0), 0);
  const totalXP = sessions.reduce((sum, item) => sum + (item.xpGained || 0), 0);
  const averageMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const lastSessionDate = sessions.length > 0 ? sessions[0]?.date : undefined;

  const weekSessions = sessions.filter((entry) => {
    const entryDate = new Date(entry.date);
    if (Number.isNaN(entryDate.getTime())) return false;
    const ageDays = (renderTimeMs - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= 7;
  });

  const activeDaysInWeek = new Set(
    weekSessions.map((entry) => {
      const d = new Date(entry.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  ).size;
  const consistencyPct = Math.round((activeDaysInWeek / 7) * 100);

  const recentSessions = sessions.slice(0, 5);

  return (
    <section className="mx-auto max-w-4xl animate-fade-in space-y-5">
      <header className="app-surface p-5">
        <p className="text-[11px] uppercase tracking-widest text-soft">Profile</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{profile.name}</h1>
        <p className="mt-1 text-sm text-soft">
          {profile.level || 'Beginner'} • {profile.email}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard icon={Flame} label="Current streak" value={`${streakStats?.currentStreak || 0} days`} />
        <InsightCard icon={Target} label="Sessions" value={`${totalSessions}`} />
        <InsightCard icon={Clock3} label="Total time" value={`${totalMinutes} min`} />
        <InsightCard icon={Sparkles} label="Total XP" value={`${totalXP}`} />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="app-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Training Insights</h2>
            <Link href="/dashboard/history" className="text-xs font-semibold text-primary hover:underline">
              Open history
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-[11px] uppercase tracking-wider text-soft">Weekly consistency</p>
              <p className="mt-1 text-2xl font-bold">{consistencyPct}%</p>
              <p className="mt-1 text-xs text-soft">{activeDaysInWeek}/7 active days</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-[11px] uppercase tracking-wider text-soft">Average session</p>
              <p className="mt-1 text-2xl font-bold">{averageMinutes} min</p>
              <p className="mt-1 text-xs text-soft">Based on your completed sessions</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-[11px] uppercase tracking-wider text-soft">Longest streak</p>
              <p className="mt-1 text-2xl font-bold">{streakStats?.longestStreak || 0} days</p>
              <p className="mt-1 text-xs text-soft">
                {streakStats?.hasTrainedToday ? 'You trained today' : 'No session logged today'}
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-[11px] uppercase tracking-wider text-soft">Last session</p>
              <p className="mt-1 text-base font-semibold">{dateLabel(lastSessionDate)}</p>
              <p className="mt-1 text-xs text-soft">Keep momentum by training today</p>
            </div>
          </div>
        </div>

        <div className="app-surface p-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Recent Sessions</h2>
          </div>
          <div className="mt-4 space-y-2">
            {recentSessions.length > 0 ? (
              recentSessions.map((entry) => (
                <div key={entry.id} className="surface-muted p-3">
                  <p className="text-sm font-semibold">{entry.sessionName || 'Training session'}</p>
                  <p className="mt-0.5 text-xs text-soft">
                    {dateLabel(entry.date)} • {entry.durationActual || 0} min
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-soft">No sessions yet.</p>
            )}
          </div>
        </div>
      </section>

      <button
        onClick={logout}
        className="app-surface flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/5"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </section>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="app-surface p-4">
      <div className="flex items-center gap-2 text-soft">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-[11px] uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}
