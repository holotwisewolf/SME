import { useState } from "react";
import { motion } from "framer-motion";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <motion.div
            className="fixed inset-0 bg-[#121212] flex items-center justify-center z-[200] px-4"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1], // premium ease
            }}
        >
            {/* Card */}
            <div className="w-full max-w-md bg-[#1f1f1f] p-10 rounded-2xl shadow-2xl">

                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-[#FFD1D1] rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl text-black font-bold">★</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white">Welcome</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Sign up to continue your journey
                    </p>
                </div>

                {/* Inputs */}
                <div className="space-y-4">

                    {/* Username */}
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-3 rounded-lg bg-[#151515] text-white border border-gray-600"
                    />

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-3 rounded-lg bg-[#151515] text-white border border-gray-600"
                    />

                    {/* Password (with show/hide icon) */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-3 rounded-lg bg-[#151515] text-white border border-gray-600 pr-12"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* Submit button */}
                <button
                    className="w-full bg-[#FFD1D1] text-black font-semibold py-3 rounded-lg mt-6 hover:bg-[#f8baba] transition"
                >
                    Sign Up
                </button>

                {/* Footer */}
                <p className="text-gray-500 text-xs text-center mt-6">
                    Make up something nice here 👀
                </p>
            </div>
        </motion.div>
    );
};

export default SignUpPage;
