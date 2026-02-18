'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Spinner } from '@/components/ui/spinner';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Suspense fallback={<AuthGuardFallback />}>
                    <AuthGuard>
                        {children}
                    </AuthGuard>
                </Suspense>
            </AuthProvider>
        </QueryClientProvider>
    );
}

function AuthGuardFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-soft italic animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}
