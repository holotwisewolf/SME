import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import UserProfileIcon from "../ui/DefUserAvatar";
import MenuIcon from "../ui/MenuIcon";
import { AuthService } from "../../features/auth/services/auth_services";
import { useLogin } from "../../features/auth/components/LoginProvider";

const UserDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, profile } = useLogin();

    // Local profile fetch removed in favor of global context
    // useEffect(() => { ... }, [user]);

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

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            setIsOpen(false);
            navigate("/"); // Redirect to home after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div ref={containerRef} className="relative z-50">
            {/* Trigger Icon & User Info */}
            <div className="flex items-center gap-4">
                {profile && (
                    <div className="flex flex-col items-end hidden md:flex mt-1.5">
                        <span className="text-white font-bold text-l tracking-wide leading-none transition-colors">
                            {profile.display_name || "User"}
                        </span>
                        <span className="text-[#6b7280] text-[10px] font-medium tracking-widest uppercase mt-1">
                            @{profile.username || "username"}
                        </span>
                    </div>
                )}

                {/* Avatar (Non-clickable) */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#2a2a2a]">
                    <UserProfileIcon className="w-12 h-12 text-[#D1D1D1]" />
                </div>

                {/* Menu Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
                >
                    <MenuIcon className="w-8 h-8 text-white" />
                </button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-[#363636] border border-gray-600 rounded-xl shadow-xl overflow-hidden origin-top-right"
                    >
                        <div className="py-1">
                            <Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Profile
                            </Link>
                            <Link
                                to="/settings"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Settings
                            </Link>
                            <div className="border-t border-gray-600 my-1"></div>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-[#FFD1D1] hover:bg-white/10 hover:text-[#ffbaba] transition-colors"
                            >
                                Log Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDropdown;
