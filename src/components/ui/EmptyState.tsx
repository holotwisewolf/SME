// EmptyState - Reusable empty state component

import React from 'react';

interface EmptyStateAction {
    label: string;
    onClick: () => void;
}

interface EmptyStateProps {
    title: string;
    description: string;
    actions?: EmptyStateAction[];
    icon?: React.ReactNode;
    variant?: 'simple' | 'detailed';
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    actions = [],
    icon,
    variant = 'simple',
}) => {
    if (variant === 'detailed') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                {icon && (
                    <div className="w-16 h-16 rounded-full bg-[#FFD1D1]/20 flex items-center justify-center mb-4">
                        {icon}
                    </div>
                )}
                <p className="text-xl font-semibold text-[#D1D1D1] mb-2">{title}</p>
                <p className="text-sm text-[#D1D1D1]/50">{description}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-[#D1D1D1]/60 text-lg mb-2">{title}</p>
            <p className="text-[#D1D1D1]/40 text-sm">{description}</p>
            {actions.length > 0 && (
                <div className="flex gap-2 mt-4">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="px-3 py-1.5 bg-[#292929] border border-[#FFD1D1]/30 text-[#D1D1D1] text-xs rounded-lg hover:bg-[#FFD1D1]/10 transition-colors"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
