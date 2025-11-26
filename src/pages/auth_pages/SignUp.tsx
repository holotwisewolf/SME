import { useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { useNavigate } from "react-router-dom";

import InputGroup from "../../components/ui/InputGroup";
import TextInput from "../../components/ui/TextInput";
import PasswordInput from "../../components/ui/PasswordInput";
import CloudLogo from "../../components/shared/CloudLogo";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const SignUpPage = () => {
    const navigate = useNavigate();
    const dragControls = useDragControls();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);

    const [hoveringEdge, setHoveringEdge] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const DRAG_THRESHOLD = 120;   // how far to pull to trigger exit
    // Fake request handler
    const handleSignUp = async () => {
        setLoading(true);
        await new Promise((res) => setTimeout(res, 1500)); // simulate delay
        setLoading(false);
    };

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
                onDragStart={(e) => e.preventDefault()} // Prevent native browser drag
                onTap={() => {
                    setIsDragging(false);
                    navigate(-1);
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
                    x: hoveringEdge || isDragging ? 12 : 0, // pushes right when hovered
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
                dragListener={false} // Only drag via controls (border)
                dragConstraints={{ left: 0 }} // Unconstrained right drag
                dragElastic={0.1} // Feel more solid
                dragMomentum={false}

                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, info) => {
                    setIsDragging(false);
                    if (info.offset.x > DRAG_THRESHOLD) {
                        navigate(-1);
                    }
                }}
                animate={{
                    x: hoveringEdge || isDragging ? 16 : 0,       // hover behavior unchanged
                    scale: hoveringEdge || isDragging ? 0.992 : 1,
                    rotateY: hoveringEdge || isDragging ? -3 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                }}
                className="w-full max-w-md bg-[#1f1f1f] p-10 rounded-2xl shadow-2xl relative select-none"
            >


                {/* Header */}
                <div className="flex flex-col items-center mb-4">
                    <div className='mb-4'>
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
                            label="Username"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

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
                    onClick={handleSignUp}
                    className="w-full bg-[#f8baba] text-black font-semibold py-4 rounded-lg mt-8 hover:bg-[#FFD1D1] transition"
                    disabled={loading}
                >
                    Sign Up
                </button>

                <p className="text-gray-500 text-xs text-center mt-6">
                    Password must be at least 8 characters long
                </p>
            </motion.div>
        </motion.div>
    );
};

export default SignUpPage;
