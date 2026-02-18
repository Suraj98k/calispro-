'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import { useProfile } from '@/lib/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, options?: { callbackUrl?: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch profile only if we have a token
    const { data: user, isLoading: isProfileLoading, error } = useProfile({ enabled: !!token });

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialized(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const login = useCallback(async (newToken: string, options?: { callbackUrl?: string }) => {
        localStorage.setItem('authToken', newToken);
        // Set cookie for server-side proxy.ts
        document.cookie = `authToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        setToken(newToken);
        // Force immediate refetch of profile with the new token
        await queryClient.invalidateQueries({ queryKey: ['profile'] });
        router.push(options?.callbackUrl || '/dashboard');
    }, [queryClient, router]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        // Clear cookie for server-side proxy.ts
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setToken(null);
        queryClient.clear(); // Clear all cached user data
        router.push('/login');
    }, [queryClient, router]);

    // If there's an error fetching profile (e.g., token expired), logout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => logout(), 0);
            return () => clearTimeout(timer);
        }
    }, [error, logout]);

    const value = {
        user: user || null,
        isAuthenticated: !!token && !error,
        isLoading: !isInitialized || (isProfileLoading && !user),
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
