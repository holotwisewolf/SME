import { motion, AnimatePresence } from "framer-motion";
import { useLogin } from "./LoginProvider";

const LoginDrawer = () => {
    const { isOpen, closeLogin } = useLogin();

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

                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full mb-4 p-3 rounded-lg bg-[#1f1f1f] text-white border border-gray-600"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full mb-6 p-3 rounded-lg bg-[#1f1f1f] text-white border border-gray-600"
                        />

                        <button className="w-full bg-[#FFD1D1] text-black font-semibold py-3 rounded-lg hover:bg-[#f8baba] transition">
                            Sign In
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginDrawer;
