import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../auth/services/auth_services";
import { useLogin } from "../../auth/components/LoginProvider";
import { useError } from "../../../context/ErrorContext";
import { useSuccess } from "../../../context/SuccessContext";

export const useUserAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const { profile, setProfile } = useLogin();

    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [bioPlaceholder, setBioPlaceholder] = useState("Tell us about yourself...");
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [initialState, setInitialState] = useState({
        displayName: "",
        bio: "",
        avatarUrl: null as string | null,
    });

    // Random Bio Placeholder
    useEffect(() => {
        const placeholders = [
            "Tell us about yourself...",
            "What's an interesting fact about you?",
            "Quite lonely in here..."
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

    // Check for Spotify auth errors
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const hashError = hashParams.get('error');

        if (error === 'access_denied' || hashError === 'access_denied') {
            showError("Spotify authorization was denied.");
            navigate('/account', { replace: true });
        }
    }, [location, navigate, showError]);

    const hasChanges =
        displayName !== initialState.displayName ||
        bio !== initialState.bio ||
        avatarUrl !== initialState.avatarUrl;

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
            showError("Failed to upload avatar.");
        }
    };

    const handleAvatarRemove = async () => {
        if (!avatarUrl) return;
        try {
            await AuthService.deleteAvatar(avatarUrl);
            setAvatarUrl(null);
        } catch (error) {
            console.error("Failed to delete avatar:", error);
            showError("Failed to delete avatar.");
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
        if (!userId || !hasChanges) return;
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
                updated_at: new Date().toISOString(),
            });

            setInitialState({
                displayName,
                bio,
                avatarUrl,
            });

            showSuccess("Profile updated successfully!");
            navigate(-1);
        } catch (error: any) {
            console.error("Update failed:", error);
            alert(error.message || "Failed to update profile.");
            setProfile(backupProfile);
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
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

        // Handlers
        handleAvatarUpload,
        handleAvatarRemove,
        handleUpdateUsername,
        handleSave,
        navigate,
    };
};
