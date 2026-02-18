import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Skill, UserSkillMastery } from '@/types';
import { cn } from '@/lib/utils';

interface SkillCardProps {
    skill: Skill;
    userMastery?: UserSkillMastery;
}

export function SkillCard({ skill, userMastery }: SkillCardProps) {
    const Icon = (Icons as unknown as Record<string, React.ElementType>)[skill.icon] || Icons.HelpCircle;

    const currentLevel = userMastery?.currentLevel ?? 0;
    const currentPoints = userMastery?.currentPoints ?? 0;

    const currentLevelData = skill.masteryLevels[currentLevel];
    const nextLevelData = skill.masteryLevels[currentLevel + 1];

    const progressPercent = nextLevelData
        ? Math.min(100, (currentPoints / nextLevelData.pointsRequired) * 100)
        : 100;

    const [animatedPercent, setAnimatedPercent] = React.useState(0);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedPercent(progressPercent);
        }, 100);
        return () => clearTimeout(timer);
    }, [progressPercent]);

    const skillId = skill.id || (skill as { _id?: string })._id;

    return (
        <Link
            href={`/dashboard/skills/${skillId}`}
            className="group relative block app-surface p-5 transition-all hover:border-primary/30 hover:bg-surface-2/80"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border border-white/5",
                    currentLevel > 0 ? "bg-primary text-primary-foreground shadow-lg shadow-amber-500/20" : "bg-black/20 text-soft"
                )}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-soft/60">Lv. {currentLevel}</p>
                    <p className="text-xs font-bold text-white tracking-widest uppercase">{currentLevelData?.label || 'Candidate'}</p>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-black text-white tracking-tight mb-1">{skill.name}</h3>
                <p className="text-[10px] text-soft line-clamp-2 leading-relaxed h-7">
                    {skill.description}
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-soft">Mastery Progress</span>
                    <span className="text-white">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(232,197,39,0.3)]"
                        style={{ width: `${animatedPercent}%` }}
                    />
                </div>
            </div>

            {nextLevelData && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black text-soft/60 uppercase">Next Unlock</span>
                    <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded">
                        {nextLevelData.unlockedExercises[0].replace('-', ' ')}
                    </span>
                </div>
            )}
        </Link>
    );
}
