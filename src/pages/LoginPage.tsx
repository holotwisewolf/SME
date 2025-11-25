import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            className="fixed inset-0 flex justify-end bg-black/30 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(-1)} // Go back when clicking backdrop
        >

            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className="w-[420px] h-full bg-[#1a1a1a] shadow-2xl p-10 overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <h1 className="text-2xl font-bold text-white mb-6">Login</h1>

                <input type="email" placeholder="Email"
                    className="w-full mb-4 p-3 rounded-lg bg-[#1f1f1f] text-white border border-gray-600" />

                <input type="password" placeholder="Password"
                    className="w-full mb-6 p-3 rounded-lg bg-[#1f1f1f] text-white border border-gray-600" />

                <button className="w-full bg-[#FFD1D1] text-black font-semibold py-3 rounded-lg hover:bg-[#f8baba] transition">
                    Sign In
                </button>
            </motion.div>

        </motion.div>
    );
};

export default LoginPage;
