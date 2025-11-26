import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedDropdownProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
    options,
    value,
    onChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-28 h-full z-50">
            <motion.div
                className="absolute top-0 right-0 w-full bg-[#363636] border border-gray-600 overflow-hidden cursor-pointer"
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={{
                    open: {
                        height: "auto",
                        borderRadius: "20px", // Maintains the pill shape curvature
                        transition: { type: "spring", stiffness: 300, damping: 25 }
                    },
                    closed: {
                        height: "100%",
                        borderRadius: "20px", // Matches the closed height (40px / 2 = 20px)
                        transition: { type: "spring", stiffness: 300, damping: 25 }
                    }
                }}
            >
                {/* The "Header" / Current Value */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-full flex items-center justify-center text-gray-200 text-xs font-medium hover:bg-black/20 transition-colors"
                    style={{ height: 40 }} // Explicit height to match closed state
                >
                    {value}
                </div>

                {/* Options */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col pb-2"
                        >
                            {options.filter(opt => opt !== value).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className="
                                        w-full text-center py-2 
                                        text-gray-300 text-xs font-medium
                                        hover:bg-black/40 hover:text-white transition-colors
                                    "
                                >
                                    {option}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AnimatedDropdown;
