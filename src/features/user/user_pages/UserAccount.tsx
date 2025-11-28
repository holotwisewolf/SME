import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TextInput from "../../../components/ui/TextInput";
import DefUserAvatar from "../../../components/ui/DefUserAvatar";
import EditIcon from "../../../components/ui/EditIcon";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { AuthService } from "../../auth/services/auth_services";
import { linkSpotifyAccount, unlinkSpotifyAccount } from "../../spotify/services/spotify_auth";
import { useLogin } from "../../auth/components/LoginProvider";

const UserAccount = () => {
    const navigate = useNavigate();
    const { profile, setProfile } = useLogin();
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSpotifyLinked, setIsSpotifyLinked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isLinking, setIsLinking] = useState(false);

    const [initialState, setInitialState] = useState({
        displayName: "",
        bio: "",
        avatarUrl: null as string | null,
    });

    // Fetch initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const session = await AuthService.getSession();
                if (!session) {
                    navigate("/");
                    return;
                }

                setUserId(session.user.id);
                setUsername(session.user.user_metadata.username || "");

                const profile = await AuthService.getProfile(session.user.id);
                if (profile) {
                    const initialData = {
                        displayName: profile.display_name || "",
                        bio: profile.bio || "",
                        avatarUrl: profile.avatar_url,
                    };
                    setDisplayName(initialData.displayName);
                    setBio(initialData.bio);
                    setAvatarUrl(initialData.avatarUrl);
                    setIsSpotifyLinked(profile.spotify_connected || false);
                    setInitialState(initialData);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setInitializing(false);
            }
        };
        loadData();
    }, [navigate]);

    // Check for changes
    const hasChanges =
        displayName !== initialState.displayName ||
        bio !== initialState.bio ||
        avatarUrl !== initialState.avatarUrl;

    // Removed early return for initializing to prevent animation blink

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !userId) return;

        const file = e.target.files[0];
        try {
            // Delete old avatar if exists
            if (avatarUrl) {
                await AuthService.deleteAvatar(avatarUrl);
            }

            const url = await AuthService.uploadAvatar(file, userId);
            setAvatarUrl(url);
        } catch (error) {
            console.error("Avatar upload failed:", error);
            alert("Failed to upload avatar.");
        }
    };

    const handleUpdateUsername = async () => {
        if (!username.trim()) {
            alert("Username cannot be empty");
            return;
        }
        try {
            await AuthService.updateUsername(username);
            setIsEditingUsername(false);
        } catch (error: any) {
            console.error("Failed to update username:", error);
            alert(error.message || "Failed to update username");
        }
    };

    const handleSpotifyToggle = async () => {
        try {
            if (isSpotifyLinked) {
                // Unlink
                if (confirm("Are you sure you want to unlink your Spotify account?")) {
                    await unlinkSpotifyAccount();
                    setIsSpotifyLinked(false);
                }
            } else {
                // Link
                setIsLinking(true);
                await linkSpotifyAccount();
                // Do not set isSpotifyLinked(true) here. 
                // The app will redirect to Spotify, and upon return, the profile data will reflect the linked status.
            }
        } catch (error) {
            console.error("Spotify toggle failed:", error);
            alert("Failed to update Spotify connection.");
            setIsLinking(false);
        }
    };

    const handleSave = async () => {
        if (!userId || !hasChanges) return;
        setLoading(true);

        // Backup current profile
        const backupProfile = { ...profile };

        try {
            // 1. Optimistic Update
            const optimisticProfile = {
                ...profile,
                display_name: displayName,
                bio: bio,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };
            setProfile(optimisticProfile);

            // 2. API Call
            await AuthService.updateProfile(userId, {
                display_name: displayName,
                bio: bio,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            });

            // Update initial state to new saved state
            setInitialState({
                displayName,
                bio,
                avatarUrl,
            });

            // Show success feedback (toast or alert)
            alert("Profile updated successfully!");
            navigate(-1);
        } catch (error: any) {
            console.error("Update failed:", error);
            alert(error.message || "Failed to update profile.");

            // Rollback on error
            setProfile(backupProfile);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-[#121212] flex items-center justify-center z-[200] px-4 overflow-hidden"
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
                                <label htmlFor="edit-avatar-upload" className="cursor-pointer block">
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
                                </label>

                                {/* Delete Avatar Button - Only show if avatar exists */}
                                {avatarUrl && (
                                    <button
                                        onClick={async () => {
                                            if (confirm("Remove profile picture?")) {
                                                try {
                                                    await AuthService.deleteAvatar(avatarUrl);
                                                    setAvatarUrl(null);
                                                } catch (error) {
                                                    console.error("Failed to delete avatar:", error);
                                                    alert("Failed to delete avatar.");
                                                }
                                            }
                                        }}
                                        className="absolute top-0 left-0 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100"
                                        title="Remove avatar"
                                    >
                                        <svg className="w-2.5 h-2.5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}

                                <input
                                    id="edit-avatar-upload"
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
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />

                            {/* Spotify Link Status */}
                            <div className="pt-2">
                                <label className="text-gray-300 text-sm font-medium px-1 block mb-1">Connected Accounts</label>
                                {isSpotifyLinked ? (
                                    <button
                                        onClick={handleSpotifyToggle}
                                        className="w-full bg-[#2a2a2a] text-[#BAFFB5] font-medium py-3.5 rounded-xl border border-transparent flex items-center justify-center gap-2 hover:bg-[#333] transition"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                        </svg>
                                        Spotify Linked (Click to Unlink)
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSpotifyToggle}
                                        disabled={isLinking}
                                        className="w-full bg-[#BAFFB5] text-black font-semibold py-2.5 rounded-xl hover:bg-[#a3e69e] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLinking ? (
                                            <LoadingSpinner className="w-5 h-5 text-black" />
                                        ) : (
                                            "Link Spotify Account"
                                        )}
                                    </button>
                                )}
                            </div>
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
        </motion.div>
    );
};

export default UserAccount;
