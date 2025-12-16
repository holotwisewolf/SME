// useAuthCheck - Hook to check if user is authenticated
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AuthCheckResult {
    isAuthenticated: boolean;
    isLoading: boolean;
    userId: string | null;
}

export function useAuthCheck(): AuthCheckResult {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            setUserId(session?.user?.id || null);
            setIsLoading(false);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setUserId(session?.user?.id || null);
        } catch (error) {
            console.error('Error checking auth:', error);
            setIsAuthenticated(false);
            setUserId(null);
        } finally {
            setIsLoading(false);
        }
    };

    return { isAuthenticated, isLoading, userId };
}
