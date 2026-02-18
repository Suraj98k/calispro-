'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

const PUBLIC_ROUTES = ['/login', '/signup', '/'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
            const isOnboardingRoute = pathname === '/onboarding';

            if (isAuthenticated) {
                // If logged in but on public route, send to dashboard (except home)
                if (isPublicRoute && pathname !== '/') {
                    const callbackUrl = searchParams.get('callbackUrl');
                    router.push(callbackUrl || '/dashboard');
                    return;
                }

                // Mandatory Onboarding Guard: If profile is incomplete, force onboarding
                // Wait until profile is fetched before making this decision
                if (user) {
                    const isProfileIncomplete = !user.level || !(user.goals && user.goals.length > 0);
                    if (isProfileIncomplete && !isOnboardingRoute) {
                        router.push('/onboarding');
                    } else if (!isProfileIncomplete && isOnboardingRoute) {
                        router.push('/dashboard');
                    }
                }
            } else if (!isPublicRoute) {
                // Not authenticated and not a public route
                router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
            }
        }
    }, [isAuthenticated, isLoading, pathname, router, searchParams, user]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="h-8 w-8 text-primary" />
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-soft italic animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
