import React, { createContext, useContext, useState } from "react";

interface LoginContextType {
    isOpen: boolean;
    openLogin: () => void;
    closeLogin: () => void;
}

const LoginContext = createContext<LoginContextType | null>(null);

export const LoginProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openLogin = () => setIsOpen(true);
    const closeLogin = () => setIsOpen(false);

    return (
        <LoginContext.Provider value={{ isOpen, openLogin, closeLogin }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => {
    const ctx = useContext(LoginContext);
    if (!ctx) throw new Error("useLogin must be used inside <LoginProvider>");
    return ctx;
};
