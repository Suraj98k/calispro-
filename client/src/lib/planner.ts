export type PlannerItemType = 'workout' | 'skill' | 'exercise';

export type PlannerItem = {
  id: string;
  type: PlannerItemType;
  refId: string;
  name: string;
  priority: number;
};

export type PlannerDay = {
  id: string;
  title: string;
  items: PlannerItem[];
};

export type PlannerState = {
  days: PlannerDay[];
  updatedAt: string;
  activePlan: {
    id: string;
    name: string;
    source: 'prebuilt' | 'custom';
  } | null;
};

const STORAGE_KEY = 'calispro:planner:v1';

const readUserIdFromToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(window.atob(padded)) as { id?: string };
    return typeof payload.id === 'string' && payload.id.length ? payload.id : null;
  } catch {
    return null;
  }
};

const getScopedStorageKey = () => {
  const userId = readUserIdFromToken();
  return userId ? `${STORAGE_KEY}:${userId}` : `${STORAGE_KEY}:anonymous`;
};

export const createPlannerId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const sortByPriority = <T extends { priority: number }>(items: T[]) => {
  return [...items].sort((a, b) => a.priority - b.priority);
};

export const loadPlanner = (): PlannerState => {
  if (typeof window === 'undefined') {
    return { days: [], updatedAt: new Date(0).toISOString(), activePlan: null };
  }

  try {
    const scopedKey = getScopedStorageKey();
    const scopedRaw = window.localStorage.getItem(scopedKey);
    const legacyRaw = window.localStorage.getItem(STORAGE_KEY);
    const raw = scopedRaw ?? legacyRaw;
    if (!raw) return { days: [], updatedAt: new Date(0).toISOString(), activePlan: null };
    const parsed = JSON.parse(raw) as PlannerState;
    if (!Array.isArray(parsed.days)) return { days: [], updatedAt: new Date(0).toISOString(), activePlan: null };

    const legacyActivePlan =
      parsed.activePlan ??
      (parsed.days.length
        ? {
            id: 'legacy-custom',
            name: 'Custom Day Plan',
            source: 'custom' as const,
          }
        : null);

    const normalized = {
      days: parsed.days.map((day) => ({
        ...day,
        items: sortByPriority(day.items || []),
      })),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      activePlan: legacyActivePlan,
    };

    if (!scopedRaw && legacyRaw) {
      window.localStorage.setItem(scopedKey, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return { days: [], updatedAt: new Date(0).toISOString(), activePlan: null };
  }
};

export const savePlanner = (state: PlannerState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getScopedStorageKey(), JSON.stringify(state));
};

export const getTodayPlanDay = (state: PlannerState): PlannerDay | null => {
  if (!state.days.length) return null;
  const now = new Date();
  const mondayFirstDayIndex = (now.getDay() + 6) % 7;
  return state.days[mondayFirstDayIndex % state.days.length] || null;
};

export const getPlanDayByOffset = (state: PlannerState, offsetDays: number): PlannerDay | null => {
  if (!state.days.length) return null;
  const now = new Date();
  const mondayFirstDayIndex = (now.getDay() + 6) % 7;
  const rawIndex = mondayFirstDayIndex + offsetDays;
  const normalizedIndex = ((rawIndex % state.days.length) + state.days.length) % state.days.length;
  return state.days[normalizedIndex] || null;
};
