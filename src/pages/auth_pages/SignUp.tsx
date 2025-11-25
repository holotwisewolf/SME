import { useState } from "react";
import { motion } from "framer-motion";
import InputGroup from "../../components/ui/InputGroup";
import TextInput from "../../components/ui/TextInput";
import PasswordInput from "../../components/ui/PasswordInput";
import CloudLogo from "../../components/shared/CloudLogo";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
                    <div className='mb-6'>
                        <CloudLogo />
                    </div>

                    <h1 className="text-3xl font-bold text-white">Welcome</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Sign up to continue your journey
                    </p>
                </div>

                {/* Inputs */}
                <div className="space-y-4">

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
                </div>

                {/* Submit button */}
                <button
                    className="w-full bg-[#FFD1D1] text-black font-semibold py-4 rounded-lg mt-8 hover:bg-[#f8baba] transition"
                >
                    Sign Up
                </button>

                {/* Footer */}
                <p className="text-gray-500 text-xs text-center mt-6">
                    Password must be at least 8 characters long
                </p>
            </div>
        </motion.div>
    );
};

export default SignUpPage;
