import { motion, AnimatePresence } from "framer-motion";
import { useLogin } from "./LoginProvider";
import TextInput from "../../../components/ui/TextInput";
import PasswordInput from "../../../components/ui/PasswordInput";
import InputGroup from "../../../components/ui/InputGroup";
import { useState } from "react";
import Checkbox from "../../../components/ui/Checkbox";
import { AuthService } from "../services/auth_services";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const LoginDrawer = () => {
    const { isOpen, closeLogin } = useLogin();
    const [canClose, setCanClose] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        setLoading(true);
        try {
            const { session, error } = await AuthService.login({ email, password, remember });
            if (error) throw error;

            if (session) {
                // Login successful
                closeLogin();
                // Reset form
                setEmail("");
                setPassword("");
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            alert(error.message || "Failed to login. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            alert("Please enter your email address first.");
            return;
        }
        try {
            await AuthService.resetPassword(email);
            alert("Password reset email sent! Please check your inbox.");
        } catch (error: any) {
            console.error("Reset password failed:", error);
            alert(error.message || "Failed to send reset email.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 flex justify-end bg-black/30 backdrop-blur-sm z-[200]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}

                    // DRAG-SAFE backplate close logic
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setCanClose(true);
                        } else {
                            setCanClose(false);
                        }
                    }}
                    onMouseUp={(e) => {
                        if (canClose && e.target === e.currentTarget) {
                            closeLogin(); // <-- triggers slide-out animation
                        }
                    }}
                >
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="w-[420px] h-full bg-[#1a1a1a] shadow-2xl p-10 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h1 className="text-2xl font-bold text-white mb-6">Sign In</h1>

                        <form onSubmit={handleLogin}>
                            <InputGroup>
                                <TextInput
                                    label="Email / Username"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <PasswordInput
                                    label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </InputGroup>
                            {/* --- NEW FOOTER --- */}
                            <div className="flex items-center justify-between mt-4 select-none">
                                <Checkbox
                                    className="mt-2 text-sm"
                                    checked={remember}
                                    onChange={setRemember}
                                    label="Remember me"
                                />

                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-gray-400 hover:text-white transition mt-2"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-[#f8baba] text-black font-semibold py-3 rounded-lg hover:bg-[#FFD1D1] transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner className="w-5 h-5" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginDrawer;
