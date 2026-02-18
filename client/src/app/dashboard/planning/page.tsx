'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck2, ChevronDown, ChevronUp, Pencil, Plus, Rocket, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useExercises, useSkills, useWorkouts } from '@/lib/hooks/useApi';
import { createPlannerId, loadPlanner, savePlanner, sortByPriority } from '@/lib/planner';
import type { PlannerDay, PlannerItem, PlannerItemType, PlannerState } from '@/lib/planner';

type PickerOption = {
  id: string;
  name: string;
  category?: string;
};

type PlanTemplateEntry = {
  type: PlannerItemType;
  name: string;
  fallbackCategory?: string;
};

type PlanTemplate = {
  id: string;
  name: string;
  description: string;
  days: { title: string; items: PlanTemplateEntry[] }[];
};

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const PREBUILT_TEMPLATES: PlanTemplate[] = [
  {
    id: 'foundation-3day',
    name: 'Foundation 3-Day',
    description: 'Balanced beginner-to-intermediate progression with full-body strength focus.',
    days: [
      {
        title: 'Day 1 - Pull + Core',
        items: [
          { type: 'workout', name: 'The Foundational Routine' },
          { type: 'skill', name: 'Muscle Up', fallbackCategory: 'Pull' },
          { type: 'exercise', name: 'Hollow Body Hold', fallbackCategory: 'Core' },
        ],
      },
      {
        title: 'Day 2 - Push + Balance',
        items: [
          { type: 'workout', name: 'Upper Body Blast' },
          { type: 'skill', name: 'Handstand', fallbackCategory: 'Balance' },
          { type: 'exercise', name: 'Handstand Hold (Wall)', fallbackCategory: 'Balance' },
        ],
      },
      {
        title: 'Day 3 - Static + Skill',
        items: [
          { type: 'workout', name: 'Static Power Protocol' },
          { type: 'skill', name: 'Planche', fallbackCategory: 'Static' },
          { type: 'exercise', name: 'Planche Lean', fallbackCategory: 'Static' },
        ],
      },
    ],
  },
  {
    id: 'skill-priority',
    name: 'Skill Priority Split',
    description: 'Technique-first plan focused on mastery skill sessions and quality finishers.',
    days: [
      {
        title: 'Day 1 - Handstand Priority',
        items: [
          { type: 'skill', name: 'Handstand', fallbackCategory: 'Balance' },
          { type: 'exercise', name: 'Handstand Hold (Wall)', fallbackCategory: 'Balance' },
          { type: 'workout', name: 'The Foundational Routine' },
        ],
      },
      {
        title: 'Day 2 - Planche Priority',
        items: [
          { type: 'skill', name: 'Planche', fallbackCategory: 'Static' },
          { type: 'exercise', name: 'Tuck Planche', fallbackCategory: 'Static' },
          { type: 'workout', name: 'Static Power Protocol' },
        ],
      },
      {
        title: 'Day 3 - Lever/Pull Priority',
        items: [
          { type: 'skill', name: 'Front Lever', fallbackCategory: 'Static' },
          { type: 'exercise', name: 'Front Lever (Tuck)', fallbackCategory: 'Static' },
          { type: 'workout', name: 'Upper Body Blast' },
        ],
      },
    ],
  },
  {
    id: 'strength-endurance',
    name: 'Strength + Endurance',
    description: 'Alternates high-tension skill work with volume-based workout sessions.',
    days: [
      {
        title: 'Day 1 - Strength Pull',
        items: [
          { type: 'workout', name: 'Upper Body Blast' },
          { type: 'exercise', name: 'Pull Up', fallbackCategory: 'Pull' },
          { type: 'skill', name: 'Muscle Up', fallbackCategory: 'Pull' },
        ],
      },
      {
        title: 'Day 2 - Static Strength',
        items: [
          { type: 'workout', name: 'Static Power Protocol' },
          { type: 'exercise', name: 'Front Lever (Tuck)', fallbackCategory: 'Static' },
          { type: 'skill', name: 'Planche', fallbackCategory: 'Static' },
        ],
      },
      {
        title: 'Day 3 - Work Capacity',
        items: [
          { type: 'workout', name: 'The Foundational Routine' },
          { type: 'exercise', name: 'Diamond Push Up', fallbackCategory: 'Push' },
          { type: 'exercise', name: 'Hanging Leg Raise', fallbackCategory: 'Core' },
        ],
      },
    ],
  },
];

const getItemBadge = (type: PlannerItemType) => {
  if (type === 'workout') return 'bg-primary/10 text-primary border-primary/20';
  if (type === 'skill') return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
  return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
};

const getItemHref = (item: PlannerItem) => {
  if (item.type === 'workout') return `/dashboard/track/${item.refId}?mode=workout`;
  if (item.type === 'skill') return `/dashboard/track/${item.refId}?mode=skill`;
  return `/dashboard/track/${item.refId}?mode=exercise`;
};

const normalizePriority = (items: PlannerItem[]) =>
  sortByPriority(items).map((item, index) => ({ ...item, priority: index + 1 }));

export default function PlanningPage() {
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { data: skills, isLoading: isSkillsLoading } = useSkills();
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();

  const [planner, setPlanner] = useState<PlannerState>(() => loadPlanner());
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [dayTitle, setDayTitle] = useState('');
  const [draftItems, setDraftItems] = useState<PlannerItem[]>([]);
  const [pickerType, setPickerType] = useState<PlannerItemType>('workout');
  const [pickerRefId, setPickerRefId] = useState('');

  const isLoading = isWorkoutsLoading || isSkillsLoading || isExercisesLoading;

  const persistPlanner = (days: PlannerDay[]) => {
    const nextState: PlannerState = {
      days,
      updatedAt: new Date().toISOString(),
      activePlan: planner.activePlan,
    };
    setPlanner(nextState);
    savePlanner(nextState);
  };

  const workoutOptions = useMemo<PickerOption[]>(
    () => (workouts || []).map((entry) => ({ id: entry.id, name: entry.name, category: 'workout' })),
    [workouts]
  );
  const skillOptions = useMemo<PickerOption[]>(
    () =>
      (skills || []).map((entry) => ({
        id: entry.id || (entry as { _id?: string })._id || '',
        name: entry.name,
        category: entry.category,
      })),
    [skills]
  );
  const exerciseOptions = useMemo<PickerOption[]>(
    () => (exercises || []).map((entry) => ({ id: entry.id, name: entry.name, category: entry.category })),
    [exercises]
  );

  const pickerOptions = useMemo(() => {
    if (pickerType === 'workout') return workoutOptions;
    if (pickerType === 'skill') return skillOptions.filter((entry) => entry.id);
    return exerciseOptions;
  }, [pickerType, workoutOptions, skillOptions, exerciseOptions]);

  const editingDay = useMemo(
    () => planner.days.find((entry) => entry.id === selectedDayId) || null,
    [planner.days, selectedDayId]
  );

  const resetEditor = () => {
    setSelectedDayId(null);
    setDayTitle('');
    setDraftItems([]);
    setPickerType('workout');
    setPickerRefId('');
  };

  const onEditDay = (day: PlannerDay) => {
    setSelectedDayId(day.id);
    setDayTitle(day.title);
    setDraftItems(sortByPriority(day.items));
  };

  const onAddItem = () => {
    if (!pickerRefId) {
      toast.error('Select an item first.');
      return;
    }

    const selected = pickerOptions.find((entry) => entry.id === pickerRefId);
    if (!selected) {
      toast.error('Selected item not found.');
      return;
    }

    const exists = draftItems.some((item) => item.type === pickerType && item.refId === pickerRefId);
    if (exists) {
      toast.error('This item is already in the day plan.');
      return;
    }

    const next = normalizePriority([
      ...draftItems,
      {
        id: createPlannerId(),
        type: pickerType,
        refId: selected.id,
        name: selected.name,
        priority: draftItems.length + 1,
      },
    ]);
    setDraftItems(next);
    setPickerRefId('');
  };

  const onMoveItem = (itemId: string, direction: 'up' | 'down') => {
    const sorted = sortByPriority(draftItems);
    const index = sorted.findIndex((entry) => entry.id === itemId);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const swapped = [...sorted];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    setDraftItems(normalizePriority(swapped));
  };

  const onRemoveItem = (itemId: string) => {
    setDraftItems((prev) => normalizePriority(prev.filter((entry) => entry.id !== itemId)));
  };

  const onSaveDay = () => {
    if (!dayTitle.trim()) {
      toast.error('Day title is required.');
      return;
    }
    if (!draftItems.length) {
      toast.error('Add at least one workout, skill, or exercise.');
      return;
    }

    const nextDay: PlannerDay = {
      id: selectedDayId || createPlannerId(),
      title: dayTitle.trim(),
      items: normalizePriority(draftItems),
    };

    if (selectedDayId) {
      persistPlanner(planner.days.map((entry) => (entry.id === selectedDayId ? nextDay : entry)));
      toast.success('Day plan updated.');
      return;
    }

    persistPlanner([...planner.days, nextDay]);
    resetEditor();
    toast.success('Day plan created.');
  };

  const onDeleteDay = (dayId: string) => {
    persistPlanner(planner.days.filter((entry) => entry.id !== dayId));
    if (selectedDayId === dayId) resetEditor();
    toast.success('Day plan deleted.');
  };

  const onResetAll = () => {
    const nextState: PlannerState = { days: [], updatedAt: new Date().toISOString(), activePlan: null };
    setPlanner(nextState);
    savePlanner(nextState);
    resetEditor();
    toast.success('Planner cleared.');
  };

  const activatePlan = (payload: { id: string; name: string; source: 'prebuilt' | 'custom' }, days?: PlannerDay[]) => {
    const nextDays = days ?? planner.days;
    const nextState: PlannerState = {
      days: nextDays,
      updatedAt: new Date().toISOString(),
      activePlan: payload,
    };
    setPlanner(nextState);
    savePlanner(nextState);
  };

  const resolveTemplateItem = (entry: PlanTemplateEntry): PickerOption | null => {
    const source = entry.type === 'workout' ? workoutOptions : entry.type === 'skill' ? skillOptions : exerciseOptions;
    const byName = source.find((item) => normalizeText(item.name) === normalizeText(entry.name));
    if (byName?.id) return byName;

    const byIncludes = source.find((item) => normalizeText(item.name).includes(normalizeText(entry.name)));
    if (byIncludes?.id) return byIncludes;

    if (entry.fallbackCategory) {
      const byCategory = source.find((item) => item.category === entry.fallbackCategory && !!item.id);
      if (byCategory?.id) return byCategory;
    }

    return null;
  };

  const onApplyTemplate = (template: PlanTemplate) => {
    const days: PlannerDay[] = template.days.map((day, dayIndex) => {
      const items = day.items
        .map((entry, index) => {
          const resolved = resolveTemplateItem(entry);
          if (!resolved) return null;
          return {
            id: createPlannerId(),
            type: entry.type,
            refId: resolved.id,
            name: resolved.name,
            priority: index + 1,
          } satisfies PlannerItem;
        })
        .filter(Boolean) as PlannerItem[];

      return {
        id: `${template.id}-day-${dayIndex + 1}-${createPlannerId()}`,
        title: day.title,
        items: normalizePriority(items),
      };
    });

    const validDays = days.filter((day) => day.items.length);
    if (!validDays.length) {
      toast.error('No matching workouts/skills/exercises were found for this template.');
      return;
    }

    activatePlan({ id: template.id, name: template.name, source: 'prebuilt' }, validDays);
    resetEditor();
    toast.success(`${template.name} is now pushed to Dashboard.`);
  };

  const onPushCustomPlan = () => {
    if (!planner.days.length) {
      toast.error('Create at least one day before pushing.');
      return;
    }
    activatePlan({ id: 'custom-plan', name: 'Custom Day Plan', source: 'custom' });
    toast.success('Custom plan pushed to Dashboard.');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <header className="app-surface p-6">
        <p className="text-[11px] uppercase tracking-widest text-soft">Planning</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Daily Plan Builder</h1>
        <p className="mt-2 text-sm text-soft">
          Choose a prebuilt plan or build your own. Push one active plan to drive Dashboard step-by-step.
        </p>
        {planner.activePlan && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-primary">
            Active on dashboard: {planner.activePlan.name}
          </div>
        )}
      </header>

      <section className="app-surface p-6">
        <h2 className="mb-4 text-lg font-black">Prebuilt Plans</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {PREBUILT_TEMPLATES.map((template) => (
            <article key={template.id} className="rounded-xl border border-border bg-surface-2/50 p-4">
              <h3 className="text-sm font-black">{template.name}</h3>
              <p className="mt-1 text-xs text-soft">{template.description}</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary">
                {template.days.length} days
              </p>
              <button
                onClick={() => onApplyTemplate(template)}
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-black uppercase tracking-wider text-primary-foreground"
              >
                <Rocket className="h-3.5 w-3.5" />
                Push to Dashboard
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <article className="app-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-black">{editingDay ? 'Edit Day Plan' : 'Create Day Plan'}</h2>
            </div>
            <button
              onClick={resetEditor}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold"
            >
              New Day
            </button>
          </div>

          <div className="space-y-3">
            <input
              value={dayTitle}
              onChange={(e) => setDayTitle(e.target.value)}
              placeholder="Day title (e.g., Day 1 - Pull Focus)"
              className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-primary/40"
            />

            <div className="grid gap-2 md:grid-cols-[120px_1fr_auto]">
              <select
                value={pickerType}
                onChange={(e) => {
                  setPickerType(e.target.value as PlannerItemType);
                  setPickerRefId('');
                }}
                className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm"
              >
                <option value="workout">Workout</option>
                <option value="skill">Skill</option>
                <option value="exercise">Exercise</option>
              </select>

              <select
                value={pickerRefId}
                onChange={(e) => setPickerRefId(e.target.value)}
                className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm"
              >
                <option value="">Select {pickerType}</option>
                {pickerOptions.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>

              <button
                onClick={onAddItem}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-surface-2 px-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {sortByPriority(draftItems).map((item, index) => (
              <div key={item.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-soft">
                        Priority {index + 1}
                      </span>
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getItemBadge(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onMoveItem(item.id, 'up')}
                      disabled={index === 0}
                      className="rounded border border-border bg-surface-2 p-1.5 disabled:opacity-40"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveItem(item.id, 'down')}
                      disabled={index === draftItems.length - 1}
                      className="rounded border border-border bg-surface-2 p-1.5 disabled:opacity-40"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="rounded border border-red-500/20 bg-red-500/10 p-1.5 text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!draftItems.length && <p className="text-xs text-soft">No plan items yet.</p>}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              onClick={onResetAll}
              disabled={!planner.days.length}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 disabled:opacity-40"
            >
              Clear All Plan Days
            </button>
            <button
              onClick={onSaveDay}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground"
            >
              {editingDay ? 'Update Day Plan' : 'Create Day Plan'}
            </button>
          </div>

          <button
            onClick={onPushCustomPlan}
            disabled={!planner.days.length}
            className="mt-3 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-primary disabled:opacity-40"
          >
            <Rocket className="h-3.5 w-3.5" />
            Push Custom Plan to Dashboard
          </button>
        </article>

        <article className="app-surface p-6">
          <h2 className="mb-4 text-lg font-black">Planned Days</h2>
          {!planner.days.length ? (
            <p className="text-sm text-soft">No day plans yet. Create Day 1 first.</p>
          ) : (
            <div className="space-y-3">
              {planner.days.map((day, idx) => (
                <div key={day.id} className="rounded-xl border border-border bg-surface-2/50 p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-soft">Day {idx + 1}</p>
                      <h3 className="text-sm font-bold">{day.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditDay(day)}
                        className="rounded border border-border bg-surface-2 p-1.5 text-soft"
                        title="Edit day plan"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDay(day.id)}
                        className="rounded border border-red-500/20 bg-red-500/10 p-1.5 text-red-300"
                        title="Delete day plan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sortByPriority(day.items).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">{item.name}</p>
                          <p className="text-[10px] uppercase tracking-wider text-soft">{item.type}</p>
                        </div>
                        <Link
                          href={getItemHref(item)}
                          className="rounded-md bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground"
                        >
                          Start
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
