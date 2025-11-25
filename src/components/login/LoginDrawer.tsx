import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLogin } from "./LoginProvider";
import TextInput from "../ui/TextInput";
import PasswordInput from "../ui/PasswordInput";
import InputGroup from "../ui/InputGroup";

const LoginDrawer = () => {
    const { isOpen, closeLogin } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 flex justify-end bg-black/30 backdrop-blur-sm z-[200]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={closeLogin} // Close when clicking backdrop
                >
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1], // premium easing curve
                        }}
                        className="w-[420px] h-full bg-[#1a1a1a] shadow-2xl p-10 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()} // don’t close when clicking inside
                    >
                        <h1 className="text-2xl font-bold text-white mb-6">Login</h1>

                        <InputGroup>
                            <TextInput
                                label="Email Address"
                                placeholder="johndoe@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <PasswordInput
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </InputGroup>


                        <button className="w-full bg-[#f8baba] text-black font-semibold py-4 rounded-lg hover:bg-[#FFD1D1] transition mt-10">
                            Sign In
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginDrawer;
