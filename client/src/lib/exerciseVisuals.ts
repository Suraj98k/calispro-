import {
  Crown,
  Dumbbell,
  Library,
  Medal,
  Waves,
  Anchor,
  Activity,
  type LucideIcon,
} from 'lucide-react';

import type { Exercise } from '@/types';

type ExerciseVisual = {
  Icon: LucideIcon;
  panelClassName: string;
  badgeClassName: string;
};

const categoryVisuals: Record<Exercise['category'], ExerciseVisual> = {
  Push: {
    Icon: Dumbbell,
    panelClassName: 'bg-gradient-to-br from-[#1a2240] to-[#0f1528]',
    badgeClassName: 'bg-blue-500/10 text-blue-300 border border-blue-500/15',
  },
  Pull: {
    Icon: Library,
    panelClassName: 'bg-gradient-to-br from-[#182030] to-[#0e1420]',
    badgeClassName: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/15',
  },
  Core: {
    Icon: Waves,
    panelClassName: 'bg-gradient-to-br from-[#1c1a38] to-[#110f24]',
    badgeClassName: 'bg-violet-500/10 text-violet-300 border border-violet-500/15',
  },
  Legs: {
    Icon: Medal,
    panelClassName: 'bg-gradient-to-br from-[#221c18] to-[#15100d]',
    badgeClassName: 'bg-amber-500/10 text-amber-300 border border-amber-500/15',
  },
  'Full Body': {
    Icon: Crown,
    panelClassName: 'bg-gradient-to-br from-[#1e1c10] to-[#131108]',
    badgeClassName: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/15',
  },
  Static: {
    Icon: Anchor,
    panelClassName: 'bg-gradient-to-br from-[#1a2e38] to-[#0f1b22]',
    badgeClassName: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/15',
  },
  Balance: {
    Icon: Activity,
    panelClassName: 'bg-gradient-to-br from-[#1d1a2e] to-[#110f1c]',
    badgeClassName: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/15',
  },
};

export function getExerciseVisual(category: Exercise['category']): ExerciseVisual {
  return categoryVisuals[category] || categoryVisuals['Full Body'];
}
