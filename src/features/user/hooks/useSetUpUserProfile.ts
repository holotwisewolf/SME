import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../auth/services/auth_services";
import { useLogin } from "../../auth/components/LoginProvider";
import { useSuccess } from "../../../context/SuccessContext";
import { useError } from "../../../context/ErrorContext";

export const useSetUpUserProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess } = useSuccess();
    const { showError } = useError();
    const { profile, setProfile } = useLogin();

    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [initialUsername, setInitialUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [bioPlaceholder, setBioPlaceholder] = useState("Tell us about yourself...");

    // Computed: username is valid and changed
    const hasUsernameChanged = username.trim() !== "" && username !== initialUsername;

    // Check for OAuth errors in URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
            const message = errorDescription
                ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
                : 'Spotify login failed. You may need to be added as an authorized developer.';
            showError(message);
            navigate('/', { replace: true });
        }
    }, [location.search, showError, navigate]);

    // Random Bio Placeholder
    useEffect(() => {
        const placeholders = [
            "Tell us about yourself...",
            "What's an interesting fact about you?",
            "Quite lonely here..."
        ];
        const randomIndex = Math.floor(Math.random() * placeholders.length);
        setBioPlaceholder(placeholders[randomIndex]);
    }, []);

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
                const usernameFromMeta = session.user.user_metadata.username || "";
                setUsername(usernameFromMeta);
                setInitialUsername(usernameFromMeta);

                const profile = await AuthService.getProfile(session.user.id);

                if (profile && profile.setup_completed) {
                    navigate("/library/playlists");
                    return;
                }

                if (profile) {
                    const metadata = session.user.user_metadata;
                    setDisplayName(profile.display_name || metadata.full_name || metadata.name || metadata.display_name || "");
                    setBio(profile.bio || "");
                    setAvatarUrl(profile.avatar_url || metadata.avatar_url || metadata.picture || null);

                    if (!username && metadata) {
                        const spotifyUsername = metadata.preferred_username || metadata.user_name || metadata.name || "";
                        const cleanUsername = spotifyUsername.replace(/\s+/g, '').toLowerCase();
                        setUsername(cleanUsername);
                        setInitialUsername(cleanUsername);
                    }
                } else {
                    const metadata = session.user.user_metadata;
                    if (metadata) {
                        if (!username) {
                            const spotifyUsername = metadata.preferred_username || metadata.user_name || metadata.name || "";
                            const cleanUsername = spotifyUsername.replace(/\s+/g, '').toLowerCase();
                            setUsername(cleanUsername);
                            setInitialUsername(cleanUsername);
                        }
                        if (!displayName) {
                            setDisplayName(metadata.full_name || metadata.name || metadata.display_name || "");
                        }
                        if (!avatarUrl) {
                            setAvatarUrl(metadata.avatar_url || metadata.picture || null);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setInitializing(false);
            }
        };
        loadData();
    }, [navigate]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !userId) return;

        const file = e.target.files[0];
        try {
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

    const handleSave = async () => {
        if (!userId) return;
        setLoading(true);

        const backupProfile = { ...profile };

        try {
            const optimisticProfile = {
                ...profile,
                display_name: displayName,
                bio: bio,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };
            setProfile(optimisticProfile);

            await AuthService.updateProfile(userId, {
                display_name: displayName,
                bio: bio,
                avatar_url: avatarUrl,
                setup_completed: true,
                updated_at: new Date().toISOString(),
            });

            if (username.trim()) {
                await AuthService.updateUsername(username, displayName);
            }

            showSuccess("Profile setup completed!");
            navigate("/library/playlists");
        } catch (error: any) {
            console.error("Setup failed:", error);
            alert(error.message || "Failed to save profile.");
            setProfile(backupProfile);
        } finally {
            setLoading(false);
        }
    };

    return {
        username, setUsername,
        displayName, setDisplayName,
        bio, setBio,
        avatarUrl,
        loading,
        initializing,
        isEditingUsername, setIsEditingUsername,
        hasUsernameChanged,
        bioPlaceholder,
        handleAvatarUpload,
        handleUpdateUsername,
        handleSave,
        navigate
    };
};
