import { useState, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
import { useNavigate } from "react-router-dom";

import InputGroup from "../../../components/ui/InputGroup";
import PasswordInput from "../../../components/ui/PasswordInput";
import CloudLogo from "../../../components/shared/CloudLogo";
import { AuthService } from "../services/auth_services";
import { useError } from "../../../context/ErrorContext";
import { useSuccess } from "../../../context/SuccessContext";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { supabase } from "../../../lib/supabaseClient";

const UpdatePassword = () => {
    const navigate = useNavigate();
    const dragControls = useDragControls();
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [hasSession, setHasSession] = useState(false);

    const [hoveringEdge, setHoveringEdge] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const DRAG_THRESHOLD = 120;

    // Check for active session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setHasSession(!!session);
            setCheckingSession(false);
        };
        checkSession();
    }, []);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            showError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            showError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            await AuthService.updatePassword(password);
            showSuccess("Password updated successfully!");
            navigate("/");
        } catch (error: any) {
            console.error("Password update error:", error);
            showError(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="fixed inset-0 bg-[#121212] flex items-center justify-center z-[200]">
                <LoadingSpinner className="w-10 h-10 text-white" />
            </div>
        );
    }

    if (!hasSession) {
        return (
            <motion.div
                className="fixed inset-0 bg-[#121212] flex items-center justify-center z-[200] px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="w-full max-w-md bg-[#1f1f1f] px-10 py-12 rounded-2xl shadow-2xl text-center">
                    <CloudLogo />
                    <h1 className="text-2xl font-bold text-white mt-6 mb-4">Session Expired</h1>
                    <p className="text-gray-400 mb-6">
                        Your password reset link has expired or is invalid. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-[#f8baba] text-black font-semibold py-4 rounded-lg hover:bg-[#FFD1D1] transition"
                    >
                        Go to Home
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="fixed inset-0 bg-[#121212] flex items-center justify-center z-[200] px-4 overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {/* LEFT SIDE HOVER SENSOR */}
            <motion.div
                className="absolute left-0 top-0 h-full w-14 cursor-grab z-30 touch-none select-none"
                onMouseEnter={() => setHoveringEdge(true)}
                onMouseLeave={() => setHoveringEdge(false)}
                onPointerDown={(e) => dragControls.start(e)}
                onDragStart={(e) => e.preventDefault()}
                onTap={() => {
                    setIsDragging(false);
                    navigate("/");
                }}
            />

            {/* GLOW EFFECT */}
            <motion.div
                animate={{ opacity: hoveringEdge || isDragging ? 0.25 : 0 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute left-0 top-0 h-full w-28 bg-gradient-to-r from-white/20 to-transparent blur-xl"
            ></motion.div>

            {/* ARROW ICON */}
            <motion.div
                initial={{ opacity: 0.3 }}
                animate={{
                    opacity: hoveringEdge || isDragging ? 1 : 0.4,
                    x: hoveringEdge || isDragging ? 12 : 0,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
                <svg viewBox="0 0 16 16" width="28" height="28" fill="white">
                    <path d="M8.70714 13.2929L3.41424 8.00001L8.70714 2.70712L7.29292 1.29291L0.585815 8.00001L7.29292 14.7071L8.70714 13.2929Z" />
                    <path d="M15.2071 13.2929L9.91424 8.00001L15.2071 2.70712L13.7929 1.29291L7.08582 8.00001L13.7929 14.7071L15.2071 13.2929Z" />
                </svg>
            </motion.div>

            {/* CARD */}
            <motion.div
                drag="x"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ left: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(_, info) => {
                    setIsDragging(false);
                    if (info.offset.x > DRAG_THRESHOLD) {
                        navigate("/");
                    }
                }}
                animate={{
                    x: hoveringEdge || isDragging ? 16 : 0,
                    scale: hoveringEdge || isDragging ? 0.992 : 1,
                    rotateY: hoveringEdge || isDragging ? -3 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                }}
                className="w-full max-w-md bg-[#1f1f1f] px-10 pt-2 pb-6 rounded-2xl shadow-2xl relative select-none"
            >
                {/* Header */}
                <div className="flex flex-col items-center mb-4">
                    <div className='mb-4'>
                        <CloudLogo />
                    </div>

                    <h1 className="text-3xl font-bold text-white">Update Password</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Enter your new password below
                    </p>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <InputGroup>
                        <PasswordInput
                            label="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <PasswordInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </InputGroup>
                </div>

                {/* Submit button */}
                <button
                    onClick={handleUpdatePassword}
                    className="w-full bg-[#f8baba] text-black font-semibold py-4 rounded-lg mt-8 hover:bg-[#FFD1D1] transition flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <LoadingSpinner className="w-5 h-5" />
                            Updating...
                        </>
                    ) : (
                        "Update Password"
                    )}
                </button>

                <p className="text-gray-500 text-xs text-center mt-6">
                    Password must be at least 8 characters long
                </p>
            </motion.div>
        </motion.div>
    );
};

export default UpdatePassword;
