import React, { useState } from "react";
import { motion } from "framer-motion";
import TextInput from "../../../components/ui/TextInput";
import DefUserAvatar from "../../../components/ui/DefUserAvatar";
import EditIcon from "../../../components/ui/EditIcon";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import ImageOptionsModal from "../../../components/ui/ImageOptionsModal";
import { useUserAccount } from "../hooks/useUserAccount";

const UserAccount = () => {
    const {
        username, setUsername,
        displayName, setDisplayName,
        bio, setBio,
        avatarUrl,
        loading,
        initializing,
        isEditingUsername, setIsEditingUsername,
        bioPlaceholder,
        isAvatarModalOpen, setIsAvatarModalOpen,
        hasChanges,
        fileInputRef,
        handleAvatarUpload,
        handleAvatarRemove,
        handleUpdateUsername,
        handleSave,
        navigate,
    } = useUserAccount();

    // Track if mouse started on backdrop (for drag-safe close)
    const [canClose, setCanClose] = useState(false);

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] px-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // DRAG-SAFE backdrop close logic
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    setCanClose(true);
                } else {
                    setCanClose(false);
                }
            }}
            onMouseUp={(e) => {
                if (canClose && e.target === e.currentTarget) {
                    navigate(-1);
                }
                setCanClose(false);
            }}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-[#1f1f1f] p-8 rounded-2xl shadow-2xl relative select-none border border-white/5 min-h-[600px] flex flex-col justify-center"
            >
                {initializing ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner className="w-10 h-10 text-[#f8baba]" />
                    </div>
                ) : (
                    <>
                        {/* Close Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-5 mb-8 pr-8">
                            <div className="relative group cursor-pointer shrink-0">
                                {/* Click to open modal */}
                                <div
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="cursor-pointer block"
                                >
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center border-2 border-transparent group-hover:border-[#FFD1D1] transition-colors">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <DefUserAvatar className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Edit Overlay */}
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <EditIcon className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </div>

                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-xl font-bold text-white truncate" title={displayName}>
                                    {displayName || "User"}
                                </h1>
                                <p className="text-gray-400 text-sm truncate" title={`@${username}`}>
                                    @{username}
                                </p>
                            </div>
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

                        {/* Actions */}
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-[#2a2a2a] text-white font-semibold py-4 rounded-lg hover:bg-[#363636] transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className={`flex-1 font-semibold py-4 rounded-lg transition disabled:cursor-not-allowed
                                    ${hasChanges
                                        ? "bg-[#f8baba] text-black hover:bg-[#FFD1D1]"
                                        : "bg-[#f8baba]/20 text-[#f8baba]/50"
                                    }`}
                                disabled={loading || !hasChanges}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                    </>
                )}
            </motion.div>

            {/* Avatar Options Modal */}
            <ImageOptionsModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onUpload={() => fileInputRef.current?.click()}
                onReset={handleAvatarRemove}
                hasCustomImage={!!avatarUrl}
            />
        </motion.div>
    );
};

export default UserAccount;
