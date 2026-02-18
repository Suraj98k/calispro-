// client/src/components/common/main-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, CalendarCheck2, Dumbbell, History, House, Library, UserRound, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();
  const hideNav = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/dashboard/track');

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: House },
    { name: 'Planning', href: '/dashboard/planning', icon: CalendarCheck2 },
    { name: 'Exercises', href: '/dashboard/exercises', icon: Library },
    { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'Skill Mastery', href: '/dashboard/roadmap', icon: Zap },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Profile', href: '/dashboard/profile', icon: UserRound },
  ];

  if (hideNav) return null;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-border bg-surface-1 p-6 md:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Calispro</p>
            <p className="text-[11px] text-soft">Calisthenics Platform</p>
          </div>
        </Link>

        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all',
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-soft hover:bg-surface-2 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3.5">
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold">Pro Plan</p>
          </div>
          <p className="text-[11px] leading-relaxed text-soft">Unlock advanced routines and progression tracking.</p>
          <button className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-primary/80">
            Upgrade
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-auto rounded-xl border border-border bg-surface-2 p-3.5">
          <p className="text-[11px] uppercase tracking-widest text-soft">Streak</p>
          <p className="mt-1 text-xl font-semibold">14 days</p>
          <p className="mt-0.5 text-[11px] text-soft">Keep going â€” one session today.</p>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-2 backdrop-blur-lg md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-soft hover:text-foreground'
                  : pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-soft hover:text-foreground'
              )}
              aria-label={item.name}
            >
              <item.icon className="h-[18px] w-[18px]" />
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
