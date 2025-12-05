import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface SuccessContextType {
    success: string | null;
    showSuccess: (message: string) => void;
    hideSuccess: () => void;
}

const SuccessContext = createContext<SuccessContextType | undefined>(undefined);

export const SuccessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [success, setSuccess] = useState<string | null>(null);

    const showSuccess = useCallback((message: string) => {
        setSuccess(message);
        // Auto-hide after 3 seconds (shorter than error)
        setTimeout(() => {
            setSuccess(null);
        }, 3000);
    }, []);

    const hideSuccess = useCallback(() => {
        setSuccess(null);
    }, []);

    return (
        <SuccessContext.Provider value={{ success, showSuccess, hideSuccess }}>
            {children}
        </SuccessContext.Provider>
    );
};

export const useSuccess = (): SuccessContextType => {
    const context = useContext(SuccessContext);
    if (!context) {
        throw new Error('useSuccess must be used within a SuccessProvider');
    }
    return context;
};
