import React from "react";
import { motion } from "framer-motion";
import TextInput from "../../../components/ui/TextInput";
import DefUserAvatar from "../../../components/ui/DefUserAvatar";
import EditIcon from "../../../components/ui/EditIcon";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useSetUpUserProfile } from "../hooks/useSetUpUserProfile";

const SetUpUserProfile = () => {
    const {
        username, setUsername,
        displayName, setDisplayName,
        bio, setBio,
        avatarUrl,
        loading,
        initializing,
        isEditingUsername, setIsEditingUsername,
        bioPlaceholder,
        handleAvatarUpload,
        handleUpdateUsername,
        handleSave,
        navigate
    } = useSetUpUserProfile();

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] px-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    // Prevent closing if required fields are empty
                    if (!username.trim() || !displayName.trim()) return;
                    navigate(-1);
                }
            }}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-[#1f1f1f] p-10 rounded-2xl shadow-2xl relative select-none border border-white/5 min-h-[600px] flex flex-col justify-center"
            >
                {initializing ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner className="w-10 h-10 text-[#f8baba]" />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="mb-6 relative group cursor-pointer">
                                <label htmlFor="avatar-upload" className="cursor-pointer">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center border-2 border-transparent group-hover:border-[#FFD1D1] transition-colors">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <DefUserAvatar className="w-16 h-16 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Edit Overlay */}
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <EditIcon className="w-6 h-6 text-white" />
                                    </div>
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
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
                                        disabled={!isEditingUsername}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={`w-full bg-[#2a2a2a] text-gray-200 rounded-xl px-4 py-3.5 outline-none border border-transparent transition-colors ${isEditingUsername ? "border-[#f8baba] bg-[#333]" : "cursor-not-allowed text-gray-500"
                                            }`}
                                    />
                                    <button
                                        onClick={() => {
                                            if (isEditingUsername) {
                                                handleUpdateUsername();
                                            } else {
                                                setIsEditingUsername(true);
                                            }
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {isEditingUsername ? (
                                            <svg className="w-5 h-5 text-[#f8baba]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <EditIcon className="w-4 h-4" />
                                        )}
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
                                placeholder={bioPlaceholder}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            onClick={handleSave}
                            className={`w-full font-semibold py-4 rounded-lg mt-8 transition disabled:cursor-not-allowed
                                ${username.trim() && displayName.trim()
                                    ? "bg-[#f8baba] text-black hover:bg-[#FFD1D1]"
                                    : "bg-[#f8baba]/20 text-[#f8baba]/50"
                                }`}
                            disabled={loading || !username.trim() || !displayName.trim()}
                        >
                            {loading ? "Saving..." : "Complete Setup"}
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default SetUpUserProfile;
