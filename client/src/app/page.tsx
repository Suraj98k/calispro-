'use client';

import { useState, useEffect, type ComponentType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Heart,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react';

const words = ['DISCIPLINE.', 'CONSISTENCY.', 'MASTERY.', 'PROWESS.', 'CALISTHENICS MODALITY.'];

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-white/10 py-4 backdrop-blur-md"
            : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Calispro
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-soft md:flex">
            <a
              href="#benefits"
              className="transition-colors hover:text-foreground"
            >
              Benefits
            </a>
            <a
              href="#product"
              className="transition-colors hover:text-foreground"
            >
              Product
            </a>
            <a
              href="#proof"
              className="transition-colors hover:text-foreground"
            >
              Results
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-soft transition-colors hover:text-primary-foreground"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg border border-white/10 bg-surface-2 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-soft transition-colors hover:text-primary-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden border-b border-border pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?q=80&w=2070&auto=format&fit=crop"
            alt="Calisthenics background"
            fill
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-80 contrast-[1.05]"
            priority
          />
          <div className="absolute inset-0 z-10 bg-linear-to-b from-background/90 via-background/20 to-background" />
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-5 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
            }}
          >
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50" />
              <div className="relative z-10">
                <motion.div
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 },
                  }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-primary/90 backdrop-blur-sm"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  COMMAND CENTER ACTIVE
                </motion.div>
                <motion.h1
                  variants={{
                    hidden: { y: 30, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="flex flex-col text-4xl font-black leading-[1.05] tracking-tight md:block md:text-7xl"
                >
                  THE OPERATING SYSTEM FOR
                  <br className="hidden md:block" />
                  <span className="inline-flex h-[1.1em] items-center md:ml-0">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentWordIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        whileHover={{
                          scale: 1.02,
                          color: "#fff",
                          textShadow: "0 0 20px rgba(232,197,39,0.5)",
                          transition: { duration: 0.2 },
                        }}
                        className="block cursor-default select-none text-primary drop-shadow-[0_0_15px_rgba(232,197,39,0.3)] md:inline"
                      >
                        {words[currentWordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </motion.h1>
                <motion.p
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 },
                  }}
                  className="mt-6 max-w-xl text-base font-medium leading-relaxed text-white/80 md:text-xl"
                >
                  Plan tactical routines, track progression velocity, and keep
                  every deployment aligned to elite performance goals.
                </motion.p>
                <motion.div
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 },
                  }}
                  className="mt-10 flex flex-wrap items-center gap-5"
                >
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Initialize Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#benefits"
                    className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                  >
                    System Specs
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="mt-16 flex flex-wrap items-center gap-8 border-t border-border pt-8 text-sm text-soft">
            <ProofStat value="2,400+" label="Active athletes" />
            <ProofStat value="180+" label="Programs created" />
            <ProofStat value="92%" label="Monthly retention" />
          </div>
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface-1 to-surface-1 p-5 md:p-7">
          <p className="text-lg font-bold uppercase tracking-widest text-primary">
            Trusted By Serious Trainees
          </p>
          <div className="mt-4 grid gap-3 text-xs font-bold uppercase tracking-[0.18em] text-soft sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2/70 px-4 py-3">
              Bodyweight Labs
            </div>
            <div className="rounded-xl border border-border bg-surface-2/70 px-4 py-3">
              Street Strength Crew
            </div>
            <div className="rounded-xl border border-border bg-surface-2/70 px-4 py-3">
              Gymnastics Prep Club
            </div>
          </div>
        </div>

        <p className="mt-12 text-lg font-bold uppercase tracking-widest text-primary">
          Why Calispro
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
          Most athletes fail from random training. Calispro fixes the daily
          execution loop.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <BenefitCard
            title="No more guesswork"
            description="Every day has a clear sequence. Athletes stop wasting effort deciding what to train."
            icon={Target}
          />
          <BenefitCard
            title="Better session quality"
            description="Guided set flow and timers reduce sloppy reps and keep training intent consistent."
            icon={Clock3}
          />
          <BenefitCard
            title="Visible momentum"
            description="History, streaks, and mastery data make progress obvious and easier to sustain."
            icon={Flame}
          />
        </div>
      </section>

      <section id="product" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="app-surface overflow-hidden">
            <div className="relative h-72 md:h-[420px]">
              <Image
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1800&auto=format&fit=crop"
                alt="Athlete using planning tools"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-white/4 p-3 backdrop-blur-sm">
                <p className="text-2xl font-bold uppercase tracking-widest text-primary">
                  Execution Layer
                </p>
                <p className="mt-1 text-lg font-semibold text-white/90">
                  Pick a plan. Start a session. Finish with complete logs.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-lg font-bold uppercase tracking-widest text-primary">
              Product Flow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              A fast path from signup to measurable progress.
            </h2>
            <div className="mt-6 space-y-3">
              <FlowRow
                title="1. Onboard once"
                description="Set level and goals to shape your starting path."
              />
              <FlowRow
                title="2. Build or select plan"
                description="Use prebuilt structure or create day-by-day custom blocks."
              />
              <FlowRow
                title="3. Train with guidance"
                description="Tracker drives sets, reps, timers, and completion logic."
              />
              <FlowRow
                title="4. Review and adjust"
                description="Use session history and streak metrics to tune weekly load."
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <FeaturePanel
            icon={Layers}
            title="Planning Engine"
            text="Daily board with create, edit, and priority ordering."
          />
          <FeaturePanel
            icon={BarChart3}
            title="Progress Intelligence"
            text="Streaks, completion, and volume trends in one place."
          />
          <FeaturePanel
            icon={ShieldCheck}
            title="Account Scoped"
            text="Each athlete sees only their own workouts and plans."
          />
        </div>
      </section>

      <section id="proof" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="app-surface p-6 md:col-span-2">
            <p className="text-lg font-bold uppercase tracking-widest text-primary">
              Social Proof
            </p>
            <blockquote className="mt-4 text-xl font-medium leading-relaxed md:text-2xl">
              &ldquo;Our athletes now complete far more planned sessions because
              the next step is always obvious.&rdquo;
            </blockquote>
            <p className="mt-3 text-sm text-soft">
              Head Coach, Bodyweight Performance Studio
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ProofTile value="31%" label="Higher plan completion" />
              <ProofTile value="2.1x" label="More weekly consistency" />
              <ProofTile value="9 min" label="Average onboarding" />
            </div>
          </div>

          <div className="app-surface p-6">
            <p className="text-lg font-bold uppercase tracking-widest text-primary">
              Outcomes
            </p>
            <div className="mt-5 space-y-4">
              <OutcomeRow
                icon={Users}
                label="Daily Active Users"
                value="2,400+"
              />
              <OutcomeRow
                icon={Trophy}
                label="Completed Sessions"
                value="95k+"
              />
              <OutcomeRow
                icon={Sparkles}
                label="User Satisfaction"
                value="4.9 / 5"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-lg font-bold uppercase tracking-widest text-primary">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Answers before you commit.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <FaqCard
            q="Is this only for advanced athletes?"
            a="No. Beginners can start with base plans and progressions, then scale weekly."
          />
          <FaqCard
            q="Can coaches use this with clients?"
            a="Yes. Coaches can structure plans and review history to guide decisions."
          />
          <FaqCard
            q="Will users know what to do next?"
            a="Yes. Dashboard and tracker flow are designed around the next clear action."
          />
          <FaqCard
            q="Can I edit plans later?"
            a="Yes. Day plans are fully editable and can be replaced at any time."
          />
        </div>

        <div className="mt-10 rounded-3xl border border-primary/20 bg-linear-to-br from-primary/15 via-surface-1 to-surface-1 p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready for a cleaner training system?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-soft">
            Build structured plans, run better sessions, and keep progress
            visible without the chaos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-soft transition-colors hover:text-foreground"
                >
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-soft">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Dumbbell className="h-3 w-3" />
            </div>
            <span className="font-medium text-foreground">Calispro</span>
            <span>© {currentYear}</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-foreground">
              Made by Suraj Gupta with
              <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
            </span>
            <span className="transition-colors hover:text-foreground">
              Terms
            </span>
            <span className="transition-colors hover:text-foreground">
              Privacy
            </span>
            <span className="transition-colors hover:text-foreground">
              Contact
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProofStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-bold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function BenefitCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="app-surface p-5 transition-all hover:border-primary/30 hover:bg-surface-2/70">
      <div className="mb-3 inline-flex rounded-lg border border-border bg-surface-2 p-2.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-soft">{description}</p>
    </article>
  );
}

function FlowRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-surface-2/40 p-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-soft">{description}</p>
      </div>
    </div>
  );
}

function FeaturePanel({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="app-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs text-soft">{text}</p>
    </div>
  );
}

function ProofTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="surface-muted p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-soft">{label}</p>
    </div>
  );
}

function OutcomeRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/60 p-3">
      <div className="flex items-center gap-2 text-soft">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function FaqCard({ q, a }: { q: string; a: string }) {
  return (
    <article className="app-surface p-5">
      <h3 className="text-sm font-semibold">{q}</h3>
      <p className="mt-2 text-sm text-soft">{a}</p>
    </article>
  );
}

