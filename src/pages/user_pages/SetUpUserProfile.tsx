import { useState } from "react";
import { motion } from "framer-motion";
import TextInput from "../../components/ui/TextInput";
import Checkbox from "../../components/ui/Checkbox";
import DefUserAvatar from "../../components/ui/DefUserAvatar";
import EditIcon from "../../components/ui/EditIcon";

const SetUpUserProfile = () => {
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [linkSpotify, setLinkSpotify] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock data for read-only username
    const username = "user_123";

    const handleSave = async () => {
        setLoading(true);
        await new Promise((res) => setTimeout(res, 1500)); // simulate delay
        setLoading(false);
        // Navigate or show success
    };

    return (
        <motion.div
            className="fixed inset-0 bg-[#121212] flex items-center justify-center z-[200] px-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-[#1f1f1f] p-10 rounded-2xl shadow-2xl relative select-none border border-white/5"
            >
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-6 relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center border-2 border-transparent group-hover:border-[#FFD1D1] transition-colors">
                            <DefUserAvatar className="w-16 h-16 text-gray-400" />
                        </div>

                        {/* Edit Overlay */}
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-white">Set Up Profile</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Customize how you appear to others
                    </p>
                </div>

                {/* Fields */}
                <div className="space-y-5">
                    {/* Username (Read-only) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-300 text-sm font-medium px-1">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                disabled
                                className="w-full bg-[#2a2a2a] text-gray-500 rounded-xl px-4 py-3.5 outline-none border border-transparent cursor-not-allowed"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <TextInput
                        label="Display Name"
                        placeholder="How should we call you?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />

                    <TextInput
                        label="Bio"
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />

                    <div className="pt-2">
                        <Checkbox
                            label="Link Spotify Account"
                            checked={linkSpotify}
                            onChange={setLinkSpotify}
                            className="bg-[#2a2a2a] p-3 rounded-xl border border-transparent hover:border-white/10 transition-colors"
                        />
                    </div>
                </div>

                {/* Submit button */}
                <button
                    onClick={handleSave}
                    className="w-full bg-[#f8baba] text-black font-semibold py-4 rounded-lg mt-8 hover:bg-[#FFD1D1] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Complete Setup"}
                </button>

            </motion.div>
        </motion.div>
    );
};

export default SetUpUserProfile;
