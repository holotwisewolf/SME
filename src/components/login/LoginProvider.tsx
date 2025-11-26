import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

interface LoginContextType {
    isOpen: boolean;
    openLogin: () => void;
    closeLogin: () => void;
    user: User | null;
}

const LoginContext = createContext<LoginContextType | null>(null);

export const LoginProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const openLogin = () => setIsOpen(true);
    const closeLogin = () => setIsOpen(false);

    return (
        <LoginContext.Provider value={{ isOpen, openLogin, closeLogin, user }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => {
    const ctx = useContext(LoginContext);
    if (!ctx) throw new Error("useLogin must be used inside <LoginProvider>");
    return ctx;
};
