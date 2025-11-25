import { motion, AnimatePresence } from "framer-motion";
import { useLogin } from "./LoginProvider";
import TextInput from "../ui/TextInput";
import PasswordInput from "../ui/PasswordInput";
import InputGroup from "../ui/InputGroup";
import { useState } from "react";
import Checkbox from "../ui/Checkbox";

const LoginDrawer = () => {
    const { isOpen, closeLogin } = useLogin();
    const [canClose, setCanClose] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

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
                        <h1 className="text-2xl font-bold text-white mb-6">Login</h1>

                        <InputGroup>
                            <TextInput
                                label="Email"
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

                            <button className="text-sm text-gray-400 hover:text-white transition mt-2">
                                Forgot password?
                            </button>
                        </div>
                        <button className="w-full mt-6 bg-[#f8baba] text-black font-semibold py-3 rounded-lg hover:bg-[#FFD1D1] transition">
                            Sign In
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginDrawer;
