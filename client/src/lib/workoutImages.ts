import type { Workout } from '@/types';

const FALLBACK_BY_LEVEL: Record<Workout['level'], string> = {
  Beginner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400&auto=format&fit=crop',
  Intermediate: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476a?q=80&w=1400&auto=format&fit=crop',
  Advanced: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1400&auto=format&fit=crop',
};

const FALLBACK_BY_KEYWORD: Array<{ keyword: string; image: string }> = [
  {
    keyword: 'leg',
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=1400&auto=format&fit=crop',
  },
  {
    keyword: 'core',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1400&auto=format&fit=crop',
  },
  {
    keyword: 'upper',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1400&auto=format&fit=crop',
  },
  {
    keyword: 'static',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=1400&auto=format&fit=crop',
  },
];

export const getWorkoutImageUrl = (workout: Pick<Workout, 'name' | 'level' | 'imageUrl'>) => {
  if (workout.imageUrl?.trim()) return workout.imageUrl;

  const normalizedName = workout.name.toLowerCase();
  const keywordMatch = FALLBACK_BY_KEYWORD.find((entry) => normalizedName.includes(entry.keyword));
  if (keywordMatch) return keywordMatch.image;

  return FALLBACK_BY_LEVEL[workout.level];
};

