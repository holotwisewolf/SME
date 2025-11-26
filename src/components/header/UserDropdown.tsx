import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import UserProfileIcon from "../ui/DefUserAvatar";
import { AuthService } from "../../services/auth_services";
import { useLogin } from "../login/LoginProvider";

const UserDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user } = useLogin();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (user) {
            AuthService.getProfile(user.id).then((data) => {
                if (data) setProfile(data);
            }).catch(err => console.error("Failed to load profile", err));
        }
    }, [user]);

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
            {/* Trigger Icon */}
            {/* Trigger Icon & User Info */}
            <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {profile && (
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors">
                            {profile.display_name || "User"}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">
                            @{profile.username || "username"}
                        </span>
                    </div>
                )}

                <button
                    className="flex items-center justify-center w-14 h-14 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                >
                    <UserProfileIcon className="w-12 h-12 text-[#D1D1D1]" />
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
