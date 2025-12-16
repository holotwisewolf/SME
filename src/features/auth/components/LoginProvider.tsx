import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabaseClient";

import { AuthService } from "../services/auth_services";

interface LoginContextType {
    isOpen: boolean;
    openLogin: () => void;
    closeLogin: () => void;
    user: User | null;
    profile: any | null;
    setProfile: (profile: any) => void;
    refreshProfile: () => Promise<void>;
    isLoading: boolean;
}

const LoginContext = createContext<LoginContextType | null>(null);

export const LoginProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const data = await AuthService.getProfile(userId);
            setProfile(data);
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Check active session
                const { data: { session } } = await supabase.auth.getSession();

                // Set user if session exists, otherwise null
                if (mounted) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            if (mounted) {
                setUser(currentUser);
                if (currentUser) {
                    fetchProfile(currentUser.id);
                } else {
                    setProfile(null);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const openLogin = () => setIsOpen(true);
    const closeLogin = () => setIsOpen(false);

    return (
        <LoginContext.Provider value={{ isOpen, openLogin, closeLogin, user, profile, setProfile, refreshProfile, isLoading }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => {
    const ctx = useContext(LoginContext);
    if (!ctx) throw new Error("useLogin must be used inside <LoginProvider>");
    return ctx;
};
