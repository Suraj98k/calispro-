'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainNav } from '@/components/common/main-nav';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isTrackingRoute = pathname.startsWith('/dashboard/track/');

    // Check if user needs onboarding completion (level + goals)
    useEffect(() => {
        const isProfileIncomplete = user && (!user.level || !(user.goals && user.goals.length > 0));
        if (!isLoading && isProfileIncomplete) {
            router.push('/onboarding');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {!isTrackingRoute && <MainNav />}
            <main className={isTrackingRoute ? 'min-h-screen' : 'min-h-screen pb-20 md:pb-10 md:pl-[260px]'}>
                {!isTrackingRoute && <DashboardHeader />}
                <div className={isTrackingRoute ? 'w-full' : 'w-full p-6 md:p-8 lg:p-10'}>
                    {children}
                </div>
            </main>
        </div>
    );
}
