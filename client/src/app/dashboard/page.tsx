"use client";

import * as Icons from "lucide-react";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Flame,
  Medal,
  PlayCircle,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

import { getExerciseVisual } from "@/lib/exerciseVisuals";
import {
  getPlanDayByOffset,
  getTodayPlanDay,
  loadPlanner,
  sortByPriority,
} from "@/lib/planner";
import { cn } from "@/lib/utils";
import { SkillCard } from "@/components/dashboard/SkillCard";
import {
  useSkills,
  useUserMastery,
  useProfile,
  useExercises,
  useWorkoutHistory,
  useWorkouts,
  useStreakStats,
} from "@/lib/hooks/useApi";
import { WorkoutHistory } from "@/types";

const normalizeText = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
const plannerItemHref = (item: {
  type: "workout" | "skill" | "exercise";
  refId: string;
}) =>
  item.type === "workout"
    ? `/dashboard/track/${item.refId}?mode=workout`
    : item.type === "skill"
      ? `/dashboard/track/${item.refId}?mode=skill`
      : `/dashboard/track/${item.refId}?mode=exercise`;

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: skills, isLoading: isSkillsLoading } = useSkills();
  const { data: mastery, isLoading: isMasteryLoading } = useUserMastery();
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();
  const { data: history, isLoading: isHistoryLoading } = useWorkoutHistory(50);
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { data: streakStats, isLoading: isStreakLoading } = useStreakStats();

  const isLoading =
    isProfileLoading ||
    isSkillsLoading ||
    isMasteryLoading ||
    isExercisesLoading ||
    isHistoryLoading ||
    isWorkoutsLoading ||
    isStreakLoading;

  const metrics = useMemo(
    () => [
      {
        label: "Mastery Points",
        value:
          mastery?.reduce((acc, m) => acc + m.currentPoints, 0).toString() ||
          "0",
        icon: Zap,
        color: "text-amber-400",
      },
      {
        label: "Skill Level",
        value: `Lv. ${mastery?.reduce((acc, m) => Math.max(acc, m.currentLevel), 0) || 0}`,
        icon: Target,
        color: "text-blue-400",
      },
      {
        label: "Current Streak",
        value: `${streakStats?.currentStreak || 0} Days`,
        icon: Flame,
        color: "text-orange-400",
      },
      {
        label: "Longest Streak",
        value: `${streakStats?.longestStreak || 0} Days`,
        icon: TrendingUp,
        color: "text-emerald-400",
      },
    ],
    [mastery, streakStats],
  );

  const filteredSkills = useMemo(() => {
    if (!skills) return [];
    if (!searchQuery) return skills;
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [skills, searchQuery]);

  const plannerState = loadPlanner();

  const todaySummary = useMemo(() => {
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
        .filter(
          (entry) =>
            (entry.sessionType || "workout") === "workout" && entry.workoutId,
        )
        .map((entry) => entry.workoutId as string),
    );
    const completedSkillIds = new Set(
      todaySessions
        .filter(
          (entry) =>
            (entry.sessionType || "workout") === "skill" && entry.skillId,
        )
        .map((entry) => entry.skillId as string),
    );
    const completedExerciseIds = new Set(
      todaySessions
        .filter(
          (entry) =>
            (entry.sessionType || "workout") === "exercise" && entry.exerciseId,
        )
        .map((entry) => entry.exerciseId as string),
    );

    return {
      todaySessions,
      completedWorkoutIds,
      completedSkillIds,
      completedExerciseIds,
    };
  }, [history]);

  const pendingWorkouts = useMemo(() => {
    if (!workouts) return [];
    return workouts.filter(
      (entry) => !todaySummary.completedWorkoutIds.has(entry.id),
    );
  }, [workouts, todaySummary.completedWorkoutIds]);

  const activeWorkout = useMemo(() => {
    if (!pendingWorkouts.length) return null;
    return (
      pendingWorkouts.find((entry) => entry.isRecommended) || pendingWorkouts[0]
    );
  }, [pendingWorkouts]);

  const focusSkill = useMemo(() => {
    if (!skills?.length) return null;
    const scored = skills.map((skill) => {
      const userState = mastery?.find((item) => item.skillId === skill.name);
      return {
        skill,
        score:
          (userState?.currentLevel || 0) * 10000 +
          (userState?.currentPoints || 0),
      };
    });
    scored.sort((a, b) => a.score - b.score);
    return scored[0]?.skill || null;
  }, [skills, mastery]);

  const focusExercise = useMemo(() => {
    if (!focusSkill || !exercises?.length) return null;
    const masteryState = mastery?.find(
      (entry) => entry.skillId === focusSkill.name,
    );
    const level = masteryState?.currentLevel ?? 0;
    const levelData =
      focusSkill.masteryLevels.find((entry) => entry.level === level) ||
      focusSkill.masteryLevels[0];
    const candidates = levelData?.unlockedExercises || [];

    for (const ref of candidates) {
      const found = exercises.find(
        (entry) =>
          entry.id === ref || normalizeText(entry.name) === normalizeText(ref),
      );
      if (found) return found;
    }

    return (
      exercises.find((entry) => entry.category === focusSkill.category) || null
    );
  }, [focusSkill, exercises, mastery]);

  const hasSkillDoneToday = useMemo(() => {
    if (!focusSkill) return false;
    return todaySummary.completedSkillIds.has(focusSkill.name);
  }, [focusSkill, todaySummary.completedSkillIds]);

  const hasExerciseDoneToday = useMemo(() => {
    if (!focusExercise) return false;
    return todaySummary.completedExerciseIds.has(focusExercise.id);
  }, [focusExercise, todaySummary.completedExerciseIds]);

  const flowPlan = useMemo(() => {
    const todayPlanDay = getTodayPlanDay(plannerState);
    if (plannerState.activePlan && todayPlanDay?.items.length) {
      const steps = sortByPriority(todayPlanDay.items).map((item) => {
        const mappedSkillName =
          item.type === "skill"
            ? (skills || []).find(
                (entry) =>
                  entry.id === item.refId ||
                  (entry as { _id?: string })._id === item.refId,
              )?.name || item.name
            : "";

        const done =
          item.type === "workout"
            ? todaySummary.completedWorkoutIds.has(item.refId)
            : item.type === "skill"
              ? todaySummary.completedSkillIds.has(mappedSkillName)
              : todaySummary.completedExerciseIds.has(item.refId);

        const href =
          item.type === "workout"
            ? `/dashboard/track/${item.refId}?mode=workout`
            : item.type === "skill"
              ? `/dashboard/track/${item.refId}?mode=skill`
              : `/dashboard/track/${item.refId}?mode=exercise`;

        return {
          key: `${item.type}-${item.id}`,
          label: item.name,
          description: `${item.type} session from your day plan.`,
          href,
          done,
        };
      });

      const current = steps.find((step) => !step.done) || null;
      const upcoming = steps.filter((step) => !step.done)[1] || null;
      return {
        steps,
        current,
        upcoming,
        source: "custom" as const,
        planName: plannerState.activePlan.name,
      };
    }

    const steps = [
      {
        key: "workout",
        label: activeWorkout ? activeWorkout.name : "Workout block complete",
        description: activeWorkout
          ? "Complete your main structured session."
          : "You completed all planned workouts today.",
        href: activeWorkout
          ? `/dashboard/workouts/${activeWorkout.id}`
          : "/dashboard/workouts",
        done: !activeWorkout,
      },
      {
        key: "skill",
        label: focusSkill ? `${focusSkill.name} mastery` : "Skill block",
        description: focusSkill
          ? "Run one focused mastery session."
          : "No skill data found yet.",
        href: focusSkill
          ? `/dashboard/track/${focusSkill.id}?mode=skill`
          : "/dashboard/roadmap",
        done: !!activeWorkout ? false : hasSkillDoneToday || !focusSkill,
      },
      {
        key: "exercise",
        label: focusExercise
          ? `${focusExercise.name} finisher`
          : "Exercise finisher",
        description: focusExercise
          ? "Polish one movement before closing the day."
          : "No exercise suggestion available.",
        href: focusExercise
          ? `/dashboard/track/${focusExercise.id}?mode=exercise`
          : "/dashboard/exercises",
        done: (!!activeWorkout ? false : hasSkillDoneToday)
          ? hasExerciseDoneToday || !focusExercise
          : false,
      },
    ];

    const current = steps.find((step) => !step.done) || null;
    const upcoming = steps.filter((step) => !step.done)[1] || null;
    return {
      steps,
      current,
      upcoming,
      source: "adaptive" as const,
      planName: null as string | null,
    };
  }, [
    activeWorkout,
    focusSkill,
    focusExercise,
    hasSkillDoneToday,
    hasExerciseDoneToday,
    plannerState,
    skills,
    todaySummary.completedWorkoutIds,
    todaySummary.completedSkillIds,
    todaySummary.completedExerciseIds,
  ]);

  const dayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const streakTargetDay = useMemo(() => {
    const streak = streakStats?.currentStreak || 0;
    return streakStats?.hasTrainedToday ? streak : streak + 1;
  }, [streakStats]);

  const suggestionMessage = useMemo(() => {
    if (flowPlan.source === "custom" && flowPlan.current) {
      return `${flowPlan.planName || "Your active plan"} is running. Follow your selected priority order step by step.`;
    }

    if (!flowPlan.current) {
      return `You completed today's training flow. Keep mobility light and recover for tomorrow.`;
    }

    if (flowPlan.current.key === "workout") {
      return `Primary session window for ${dayLabel}. Complete the structured workout first, then move into skill and finisher blocks.`;
    }

    if (flowPlan.current.key === "skill") {
      return `Strength base is done for ${dayLabel}. This block sharpens technique and moves your mastery level forward.`;
    }

    return `Final block for ${dayLabel}. Use this focused movement session to lock in quality reps before recovery.`;
  }, [flowPlan, dayLabel]);

  const tomorrowPlan = useMemo(() => {
    const nextDay = getPlanDayByOffset(plannerState, 1);
    const nextItem = nextDay?.items?.length
      ? sortByPriority(nextDay.items)[0]
      : null;
    return {
      day: nextDay,
      item: nextItem,
      href: nextItem ? plannerItemHref(nextItem) : "/dashboard/planning",
    };
  }, [plannerState]);

  const libraryItems = useMemo(() => {
    const list = [
      ...(exercises?.map((e) => ({ ...e, type: "exercise" as const })) || []),
      ...(workouts?.map((w) => ({ ...w, type: "workout" as const })) || []),
    ];
    return list
      .filter(
        (item) =>
          !searchQuery ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.type === "exercise" &&
            item.category.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .slice(0, 4);
  }, [exercises, workouts, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userProfile = profile || { name: "User", email: "" };

  return (
    <div className="animate-fade-in space-y-6">
      <section className="app-surface overflow-hidden">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x border-border">
          <div className="flex-1 p-4 md:p-4 bg-linear-to-br from-surface-2 to-transparent">
            <div className="flex items-center gap-5 mb-8">
              <div className="relative">
                <div className="h-16 w-16 rounded-xl bg-linear-to-tr from-primary to-amber-200 p-0.5 shadow-xl shadow-amber-500/10">
                  <div className="h-full w-full rounded-xl bg-surface-1 flex items-center justify-center border-2 border-surface-1">
                    <span className="text-xl font-black text-white">
                      {userProfile.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-surface-1 shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white leading-none">
                  Welcome, {userProfile.name.split(" ")[0]}
                </h1>
              </div>
            </div>

            <div className="relative group max-w-2xl mb-10">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-soft/40 group-focus-within:text-primary transition-colors" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, movements, or protocols..."
                className="h-14 w-full rounded-2xl border border-border bg-black/30 pl-12 pr-6 text-sm font-medium outline-none transition-all focus:border-primary/40 focus:bg-black/50 placeholder:text-soft/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flowPlan.current ? (
                <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5 transition-all hover:border-primary/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        Active Session
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-soft/60 uppercase">
                      Recommended
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1 group-hover:text-primary transition-colors">
                    {flowPlan.current.label}
                  </h3>
                  <p className="text-[11px] text-soft/80 mb-6 line-clamp-1">
                    {flowPlan.current.description}
                  </p>
                  <Link
                    href={flowPlan.current.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-black text-primary-foreground uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Icons.Play className="h-3.5 w-3.5 fill-current" />
                    Start now
                  </Link>
                </div>
              ) : flowPlan.source === "custom" && tomorrowPlan.day ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Plan Completed
                  </p>
                  <h3 className="mt-2 text-lg font-black text-white">
                    Today&apos;s day plan is complete
                  </h3>
                  <p className="mt-1 text-[11px] text-soft/80">
                    Tomorrow:{" "}
                    <span className="font-bold text-white">
                      {tomorrowPlan.day.title}
                    </span>
                    {tomorrowPlan.item ? ` - ${tomorrowPlan.item.name}` : ""}
                  </p>
                  <Link
                    href={tomorrowPlan.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-primary-foreground"
                  >
                    <Icons.Play className="h-3.5 w-3.5 fill-current" />
                    Start Tomorrow&apos;s Recommendation
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-5 flex items-center justify-center text-soft italic text-xs">
                  Daily plan completed. Entering recovery cycle.
                </div>
              )}

              {flowPlan.upcoming ? (
                <div className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-2/40 p-5 transition-all hover:border-border-strong">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-soft/30" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-soft/60">
                        Upcoming
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-soft/40 uppercase">
                      Next Protocol
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1 group-hover:text-foreground transition-colors">
                    {flowPlan.upcoming.label}
                  </h3>
                  <p className="text-[11px] text-soft/60 mb-6 truncate">
                    {flowPlan.upcoming.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-soft">
                      <Icons.Clock3 className="h-3 w-3" />
                      {activeWorkout?.durationEstimate || "--"}m
                    </div>
                    <div className="h-3 w-[1px] bg-border" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-soft">
                      <Icons.Zap className="h-3 w-3" />
                      {activeWorkout?.level || "N/A"}
                    </div>
                  </div>
                </div>
              ) : flowPlan.source === "custom" && tomorrowPlan.day ? (
                <div className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-2/40 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-soft/30" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-soft/60">
                        Tomorrow
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-soft/40 uppercase">
                      Planned
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">
                    {tomorrowPlan.day.title}
                  </h3>
                  <p className="text-[11px] text-soft/60 mb-6 truncate">
                    {tomorrowPlan.item
                      ? `Next recommendation: ${tomorrowPlan.item.name}`
                      : "Add items to tomorrow plan."}
                  </p>
                  <Link
                    href="/dashboard/planning"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px] font-black uppercase tracking-wider"
                  >
                    View Plan
                  </Link>
                </div>
              ) : (
                <div className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-2/40 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-soft/30" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-soft/60">
                        Rest
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">
                    Recovery Cycle
                  </h3>
                  <p className="text-[11px] text-soft/60">
                    Focus on mobility and restoration.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-80 p-6 flex flex-col justify-center gap-4 bg-surface-1/50">
            <div className="grid grid-cols-1 gap-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-surface-2/40 hover:bg-surface-2/60 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn("p-2.5 rounded-xl bg-black/30", m.color)}
                    >
                      <m.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-soft/50 leading-none mb-1.5">
                        {m.label}
                      </p>
                      <p className="text-xl font-black text-white tracking-tighter leading-none">
                        {m.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="app-surface p-4">
            <div className="flex items-center justify-between mb-5 px-1">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Skill Mastery
                </h2>
                <p className="text-xs text-soft font-medium">
                  Progress your calisthenics capabilities
                </p>
              </div>
              <Link
                href="/dashboard/roadmap"
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center gap-1.5"
              >
                Open Skill Mastery
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.slice(0, 3).map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  userMastery={mastery?.find((m) => m.skillId === skill.name)}
                />
              ))}
            </div>
          </section>

          <section className="app-surface p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Movement Library
                </h2>
                <p className="text-xs text-soft">
                  Master the fundamental progressions
                </p>
              </div>
              <Link
                href="/exercises"
                className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider hover:opacity-80 transition-opacity"
              >
                All Systems
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {libraryItems.map((item) => {
                const visual =
                  item.type === "exercise"
                    ? getExerciseVisual(item.category)
                    : { Icon: Icons.Zap, panelClassName: "bg-primary/10" };

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={
                      item.type === "exercise"
                        ? `/dashboard/exercises/${item.id}`
                        : `/dashboard/workouts/${item.id}`
                    }
                    className="group relative flex items-center gap-4 p-4 rounded-2xl border border-border-subtle bg-surface-2/30 hover:border-border-strong hover:bg-surface-2/60 transition-all"
                  >
                    <div
                      className={cn(
                        "h-14 w-14 shrink-0 rounded-xl flex items-center justify-center border border-white/5 bg-black/20",
                        visual.panelClassName,
                      )}
                    >
                      <visual.Icon className="h-6 w-6 text-white/30 group-hover:text-white/70 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate text-sm">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-black text-soft/60 tracking-wider px-1.5 py-0.5 bg-black/20 rounded-md">
                          {item.type === "exercise"
                            ? item.category
                            : "Protocol"}
                        </span>
                        <span className="text-[9px] font-bold text-soft/80 uppercase tracking-tighter">
                          {item.level}
                        </span>
                      </div>
                    </div>
                    <Icons.ChevronRight className="h-4 w-4 text-soft/30 group-hover:text-soft group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <article className="app-surface relative overflow-hidden group bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-xl shadow-amber-500/[0.03]">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transition-transform group-hover:scale-110 group-hover:rotate-6">
              <Zap className="h-32 w-32" />
            </div>
            {flowPlan.current ? (
              <div className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Daily Flow Recommendation
                  </p>
                  <span className="ml-auto text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30">
                    {flowPlan.source === "custom"
                      ? flowPlan.planName || "Custom Plan"
                      : "Adaptive"}
                  </span>
                </div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/70">
                    {dayLabel}
                  </span>
                  <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-orange-300">
                    Streak Day {streakTargetDay}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-3 leading-tight">
                  {flowPlan.current.label}
                </h2>
                <p className="text-xs text-soft leading-relaxed mb-6">
                  <span className="text-white font-bold italic">
                    Coach&apos;s Note:
                  </span>{" "}
                  {suggestionMessage}
                </p>
                {!streakStats?.hasTrainedToday &&
                  (streakStats?.currentStreak || 0) > 0 && (
                    <p className="mb-6 rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-orange-300">
                      Streak Risk: {streakStats?.currentStreak}-day streak will
                      break if you skip today.
                    </p>
                  )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <Clock3 className="h-4 w-4 text-soft" />
                    <span className="text-[10px] font-bold text-white">
                      {activeWorkout?.durationEstimate || "--"} MIN
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-white">
                      {todaySummary.todaySessions.length} DONE TODAY
                    </span>
                  </div>
                </div>

                <Link
                  href={flowPlan.current.href}
                  className="flex items-center justify-center gap-3 w-full rounded-2xl bg-primary py-4 text-xs font-black text-primary-foreground shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
                >
                  <PlayCircle className="h-5 w-5" />
                  Start Current Step
                </Link>
              </div>
            ) : flowPlan.source === "custom" && tomorrowPlan.day ? (
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                  Plan Completed
                </p>
                <h3 className="text-base font-black text-white">
                  {tomorrowPlan.day.title}
                </h3>
                <p className="mt-2 text-xs text-soft">
                  {tomorrowPlan.item
                    ? `Tomorrow recommendation: ${tomorrowPlan.item.name}`
                    : "Tomorrow plan is ready."}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={tomorrowPlan.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start Tomorrow
                  </Link>
                  <Link
                    href="/dashboard/planning"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    View Plan
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-soft italic text-xs">
                No active steps left for today.
              </div>
            )}
          </article>

          <section className="app-surface p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <Medal className="h-4 w-4 text-primary" />
              Today&apos;s Flow
            </h3>
            <div className="relative pl-6 border-l-2 border-white/5 space-y-6">
              {flowPlan.steps.map((step, index) => (
                <div
                  key={step.key}
                  className={cn("relative", step.done && "opacity-50")}
                >
                  <div
                    className={cn(
                      "absolute -left-[33px] top-0 h-4 w-4 rounded-full border-4 border-surface-1",
                      step.done
                        ? "bg-emerald-500"
                        : index === 0
                          ? "bg-primary shadow-[0_0_10px_rgba(232,197,39,0.5)]"
                          : "bg-white/20",
                    )}
                  />
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-wider mb-1 font-black",
                      step.done ? "text-emerald-400" : "text-primary",
                    )}
                  >
                    {step.done ? "Completed" : "Pending"}
                  </p>
                  <p className="text-sm font-black text-white leading-tight">
                    {step.label}
                  </p>
                  <p className="text-[10px] text-soft mt-1">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <section className="app-surface p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Activity Log
          </h3>
          <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest animate-pulse">
            UPDATING
          </span>
        </div>
        <div className="space-y-4">
          {(history || []).map((entry: WorkoutHistory) => (
            <div
              key={entry.id}
              className="relative group p-4 rounded-2xl bg-surface-2/40 border border-border-subtle hover:border-white/10 transition-all"
            >
              {(() => {
                const sessionType = entry.sessionType || "workout";
                const workout = workouts?.find((w) => w.id === entry.workoutId);
                const skill = skills?.find(
                  (s) => s.name === entry.skillId || s.id === entry.skillId,
                );
                const exercise = exercises?.find(
                  (e) => e.id === entry.exerciseId,
                );
                const title =
                  entry.sessionName ||
                  (sessionType === "workout" && workout?.name) ||
                  (sessionType === "skill" && (skill?.name || entry.skillId)) ||
                  (sessionType === "exercise" &&
                    (exercise?.name || entry.exerciseId)) ||
                  "Training Session";

                return (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                        {title}
                      </p>
                      <p className="text-[9px] text-soft/60 font-medium uppercase">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-400">
                        +{entry.xpGained} XP
                      </p>
                      <p className="text-[9px] font-bold text-soft/40 uppercase mt-0.5">
                        {entry.durationActual}m total
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
