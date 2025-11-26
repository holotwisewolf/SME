import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
    label,
    value,
    onChange,
    options,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find((opt) => opt.value === value)?.label || value;

    return (
        <div className="flex flex-col gap-1 relative" ref={containerRef}>
            <label className="text-gray-300 text-sm font-medium px-1">{label}</label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full bg-[#2a2a2a] text-gray-200 rounded-xl px-4 py-3.5 
                    border border-transparent transition-colors flex justify-between items-center
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#333]"}
                    ${isOpen ? "border-[#f8baba]" : ""}
                `}
            >
                <span>{selectedLabel}</span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[calc(100%+4px)] left-0 w-full bg-[#2a2a2a] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    px-4 py-3 cursor-pointer transition-colors text-sm
                                    ${value === option.value ? "bg-[#f8baba] text-black font-medium" : "text-gray-200 hover:bg-[#333]"}
                                `}
                            >
                                {option.label}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SelectInput;
