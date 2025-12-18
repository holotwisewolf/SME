import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

interface ConfirmationContextType {
    showConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<ConfirmationOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const showConfirmation = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        if (resolvePromise) {
            resolvePromise(true);
        }
        setOptions(null);
        setResolvePromise(null);
    };

    const handleCancel = () => {
        if (resolvePromise) {
            resolvePromise(false);
        }
        setOptions(null);
        setResolvePromise(null);
    };

    return (
        <ConfirmationContext.Provider value={{ showConfirmation }}>
            {children}
            <ConfirmationModal
                isOpen={!!options}
                title={options?.title || ''}
                message={options?.message || ''}
                confirmText={options?.confirmText || 'Confirm'}
                cancelText={options?.cancelText || 'Cancel'}
                confirmVariant={options?.variant || 'primary'}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = (): ConfirmationContextType => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
};
