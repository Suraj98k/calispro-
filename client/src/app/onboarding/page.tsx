'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dumbbell,
    ChevronRight,
    ChevronLeft,
    Zap,
    Target,
    Trophy,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUpdateProfile } from '@/lib/hooks/useApi';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';


type Step = 'experience' | 'goals' | 'summary';

export default function OnboardingPage() {
    const router = useRouter();
    const { mutate: updateProfile, isPending } = useUpdateProfile();
    const [step, setStep] = useState<Step>('experience');
    const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [goals, setGoals] = useState<string[]>([]);

    const experiences = [
        {
            id: 'Beginner',
            title: 'Beginner',
            desc: 'You are just getting started or coming back after a break.',
            icon: Dumbbell,
            color: 'text-blue-400'
        },
        {
            id: 'Intermediate',
            title: 'Intermediate',
            desc: 'You train regularly and can do common exercises with good form.',
            icon: Zap,
            color: 'text-amber-400'
        },
        {
            id: 'Advanced',
            title: 'Advanced',
            desc: 'You are experienced and want harder training and progress.',
            icon: Trophy,
            color: 'text-red-400'
        },
    ];

    const goalOptions = [
        { id: 'strength', label: 'Maximum Strength', icon: Target },
        { id: 'skills', label: 'Skill Mastery (Handstand, Planche)', icon: Zap },
        { id: 'endurance', label: 'Muscular Endurance', icon: CheckCircle2 },
        { id: 'aesthetics', label: 'Body Composition', icon: Dumbbell },
    ];

    const toggleGoal = (id: string) => {
        setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    };

    const handleFinish = () => {
        updateProfile({
            level: experience,
            goals: goals
        }, {
            onSuccess: () => {
                toast.success('Profile saved successfully!');
                router.push('/dashboard');
            },
            onError: () => {
                toast.error('Failed to save your details.');
            }
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-2xl w-full relative z-10">
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 mb-6"
                    >
                        <Dumbbell className="h-6 w-6" />
                    </motion.div>
                    <motion.h1
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-black tracking-tight text-white mb-3"
                    >
                        Let&apos;s Set Up Your Profile
                    </motion.h1>
                    <motion.p
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-soft font-medium"
                    >
                        We will use this to personalize your plan.
                    </motion.p>
                </header>

                <AnimatePresence mode="wait">
                    {step === 'experience' && (
                        <motion.div
                            key="experience"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Choose Your Level</h2>
                                <p className="text-xs text-soft mt-1">Pick the option that best matches your current fitness.</p>
                            </div>

                            <div className="grid gap-4">
                                {experiences.map((exp) => (
                                    <button
                                        key={exp.id}
                                        onClick={() => setExperience(exp.id as 'Beginner' | 'Intermediate' | 'Advanced')}
                                        className={cn(
                                            "group relative flex items-center gap-6 p-6 rounded-3xl border transition-all text-left",
                                            experience === exp.id
                                                ? "bg-primary/10 border-primary shadow-xl shadow-primary/5"
                                                : "bg-surface-2/40 border-border hover:border-border-strong hover:bg-surface-2/60"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 bg-black/40 transition-colors",
                                            experience === exp.id ? "bg-primary text-primary-foreground" : exp.color
                                        )}>
                                            <exp.icon className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{exp.title}</h3>
                                            <p className="text-xs text-soft leading-relaxed mt-1">{exp.desc}</p>
                                        </div>
                                        {experience === exp.id && (
                                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end pt-8">
                                <Button
                                    onClick={() => setStep('goals')}
                                    className="h-12 px-8 rounded-2xl bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 group"
                                >
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'goals' && (
                        <motion.div
                            key="goals"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Choose Your Goals</h2>
                                <p className="text-xs text-soft mt-1">Select what you want to improve first.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {goalOptions.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => toggleGoal(goal.id)}
                                        className={cn(
                                            "group flex flex-col items-center justify-center p-8 rounded-3xl border transition-all text-center gap-4",
                                            goals.includes(goal.id)
                                                ? "bg-primary/10 border-primary shadow-xl shadow-primary/5"
                                                : "bg-surface-2/40 border-border hover:border-border-strong hover:bg-surface-2/60"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center border border-white/5 bg-black/40",
                                            goals.includes(goal.id) ? "text-primary" : "text-soft/60 group-hover:text-soft"
                                        )}>
                                            <goal.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wide">{goal.label}</h3>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between pt-8">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep('experience')}
                                    className="h-12 px-6 rounded-2xl text-soft font-bold uppercase tracking-widest group"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep('summary')}
                                    disabled={goals.length === 0}
                                    className="h-12 px-8 rounded-2xl bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 group"
                                >
                                    Review
                                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-8"
                        >
                            <div className="py-12 flex flex-col items-center">
                                <div className="h-24 w-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-8 relative">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 rounded-full border-2 border-emerald-500/50"
                                    />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">You&apos;re All Set</h2>
                                <div className="p-6 rounded-3xl bg-surface-2/40 border border-border w-full max-w-sm text-left">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black uppercase text-soft tracking-[0.2em]">Level</span>
                                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{experience}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-soft tracking-[0.2em]">Goals</span>
                                        <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">{goals.length} Selected</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={handleFinish}
                                    disabled={isPending}
                                    className="h-14 w-full rounded-2xl bg-primary font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner />
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        'Go to Dashboard'
                                    )}
                                </Button>
                                <p className="text-[10px] text-soft/40 font-bold uppercase tracking-widest italic">
                                    You can update these anytime in your profile.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
