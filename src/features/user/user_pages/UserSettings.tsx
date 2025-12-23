import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import PasswordInput from "../../../components/ui/PasswordInput";
import Checkbox from "../../../components/ui/CheckboxIcon";
import TextInput from "../../../components/ui/TextInput";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useUserSettings } from "../hooks/useUserSettings";

const UserSettings = () => {
    const {
        isPublicRating, setIsPublicRating,
        isDeveloper, setIsDeveloper,
        inviteCode, setInviteCode,
        showPasswordChange, setShowPasswordChange,
        oldPassword, setOldPassword,
        newPassword, setNewPassword,
        loading,
        deletingAccount,
        initializing,
        initialState,
        hasChanges,
        handlePasswordUpdate,
        handleDeleteAccount,
        handleSave,
        navigate,
    } = useUserSettings();

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] px-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    navigate(-1);
                }
            }}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none" />

            <motion.div
                layout
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-md bg-[#1f1f1f] rounded-2xl shadow-2xl relative select-none border border-white/5 h-[80vh] max-h-[800px] flex flex-col overflow-hidden"
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
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header - Fixed */}
                        <div className="flex flex-col items-center pt-10 pb-6 px-10 border-b border-white/5 bg-[#1f1f1f] z-10">
                            <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4 text-gray-400">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-white">Settings</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Manage your account preferences
                            </p>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">

                            {/* Security Section */}
                            <div className="bg-[#2a2a2a]/50 p-4 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4">Security</h3>

                                <AnimatePresence>
                                    {!showPasswordChange ? (
                                        <motion.button
                                            layout
                                            key="change-password-btn"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            onClick={() => setShowPasswordChange(true)}
                                            className="w-full bg-[#363636] text-white text-sm font-medium py-3 rounded-lg hover:bg-[#404040] transition flex items-center justify-between px-4 overflow-hidden"
                                        >
                                            Change Password
                                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            layout
                                            key="password-fields"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            <PasswordInput
                                                label="Old Password"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="bg-[#1f1f1f]"
                                            />
                                            <PasswordInput
                                                label="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="bg-[#1f1f1f]"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => setShowPasswordChange(false)}
                                                    className="flex-1 py-2 text-xs text-gray-400 hover:text-white transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handlePasswordUpdate}
                                                    className="flex-1 bg-[#f8baba] text-black text-xs font-bold py-2 rounded hover:bg-[#FFD1D1] transition"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Privacy Section */}
                            <div className="bg-[#2a2a2a]/50 p-4 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4">Privacy</h3>
                                <Checkbox
                                    label="Public Visibility"
                                    description="When enabled, your profile and activity are visible to the community."
                                    checked={isPublicRating}
                                    onChange={setIsPublicRating}
                                />
                            </div>

                            {/* Developer Section */}
                            <div className="bg-[#2a2a2a]/50 p-4 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4">Developer</h3>
                                <div className="space-y-4">
                                    <Checkbox
                                        label={initialState.isDeveloper
                                            ? "Linked to Dev, uncheck to unlink"
                                            : "I'm a developer"}
                                        checked={isDeveloper}
                                        onChange={(val) => {
                                            setIsDeveloper(val);
                                            if (!val) {
                                                setInviteCode(""); // Reset code if disabled
                                            }
                                        }}
                                    />

                                    <AnimatePresence>
                                        {isDeveloper && !initialState.isDeveloper && (
                                            <motion.div
                                                layout
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden p-1"
                                            >
                                                <TextInput
                                                    label="Invite Code"
                                                    placeholder="Enter your invite code"
                                                    value={inviteCode}
                                                    onChange={(e) => setInviteCode(e.target.value)}
                                                    className="bg-[#1f1f1f]"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-[#2a2a2a]/50 p-4 rounded-xl border border-red-500/20">
                                <h3 className="text-red-400 font-medium mb-3">Danger Zone</h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    Permanently delete your account and all associated data.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deletingAccount}
                                    className="px-4 py-2 border border-solid border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deletingAccount ? 'Deleting...' : 'Delete My Account'}
                                </button>
                            </div>

                        </div>

                        {/* Footer Actions - Fixed */}
                        <div className="flex gap-3 p-6 border-t border-white/10 bg-[#1f1f1f] rounded-b-2xl z-10">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-[#2a2a2a] text-white font-semibold py-4 rounded-lg hover:bg-[#363636] transition"
                            >
                                Close
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
                                {loading ? "Saving..." : "Save Preferences"}
                            </button>
                        </div>

                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default UserSettings;
