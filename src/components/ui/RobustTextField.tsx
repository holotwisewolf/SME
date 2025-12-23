import React, { forwardRef } from 'react';

interface RobustTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    containerClassName?: string;
}

/**
 * RobustTextField - A text input that prevents event propagation issues.
 * 
 * Use this component in modals or draggable contexts where text selection
 * and highlighting should work without triggering parent drag handlers
 * or closing the modal.
 */
export const RobustTextField = forwardRef<HTMLInputElement, RobustTextFieldProps>(
    ({ label, containerClassName = '', className = '', ...props }, ref) => {

        // Stop all events that could interfere with text selection/input
        const stopPropagation = (e: React.SyntheticEvent) => {
            e.stopPropagation();
        };

        const preventDrag = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        return (
            <div
                className={containerClassName}
                onMouseDown={stopPropagation}
                onPointerDown={stopPropagation}
                onClick={stopPropagation}
            >
                {label && (
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    {...props}
                    className={`w-full bg-[#282828] text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8baba] border border-transparent focus:border-[#f8baba]/50 ${className}`}

                    // Prevent native drag behavior
                    draggable={false}
                    onDragStart={preventDrag}

                    // Stop propagation on all critical events
                    onMouseDown={stopPropagation}
                    onPointerDown={stopPropagation}
                    onClick={stopPropagation}
                    onKeyDown={stopPropagation}
                    onFocus={stopPropagation}
                />
            </div>
        );
    }
);

RobustTextField.displayName = 'RobustTextField';

// ============================================
// ROBUST TEXTAREA - Same concept for multi-line input
// ============================================

interface RobustTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    containerClassName?: string;
}

export const RobustTextArea = forwardRef<HTMLTextAreaElement, RobustTextAreaProps>(
    ({ label, containerClassName = '', className = '', ...props }, ref) => {

        // Stop all events that could interfere with text selection/input
        const stopPropagation = (e: React.SyntheticEvent) => {
            e.stopPropagation();
        };

        const preventDrag = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        return (
            <div
                className={containerClassName}
                onMouseDown={stopPropagation}
                onPointerDown={stopPropagation}
                onClick={stopPropagation}
            >
                {label && (
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    {...props}
                    className={`w-full bg-transparent text-white resize-none outline-none ${className}`}

                    // Prevent native drag behavior
                    draggable={false}
                    onDragStart={preventDrag}

                    // Stop propagation on all critical events
                    onMouseDown={stopPropagation}
                    onPointerDown={stopPropagation}
                    onClick={stopPropagation}
                    onKeyDown={stopPropagation}
                    onFocus={stopPropagation}
                />
            </div>
        );
    }
);

RobustTextArea.displayName = 'RobustTextArea';

export default RobustTextField;
