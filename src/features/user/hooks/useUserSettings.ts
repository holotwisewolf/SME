import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../auth/services/auth_services";
import { useLogin } from "../../auth/components/LoginProvider";
import { useSuccess } from "../../../context/SuccessContext";

export const useUserSettings = () => {
    const navigate = useNavigate();
    const { showSuccess } = useSuccess();
    const { profile, setProfile } = useLogin();

    const [userId, setUserId] = useState<string | null>(null);
    const [isPublicRating, setIsPublicRating] = useState(false);
    const [isDeveloper, setIsDeveloper] = useState(false);
    const [inviteCode, setInviteCode] = useState("");

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const [initialState, setInitialState] = useState({
        isPublicRating: false,
        isDeveloper: false,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const session = await AuthService.getSession();
                if (!session) {
                    navigate("/");
                    return;
                }
                setUserId(session.user.id);

                const profile = await AuthService.getProfile(session.user.id);
                if (profile) {
                    const initialData = {
                        isPublicRating: !(profile.is_private_profile ?? false),
                        isDeveloper: profile.app_role === 'dev',
                    };
                    setIsPublicRating(initialData.isPublicRating);
                    setIsDeveloper(initialData.isDeveloper);
                    setInitialState(initialData);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setInitializing(false);
            }
        };
        loadData();
    }, [navigate]);

    const hasChanges =
        isPublicRating !== initialState.isPublicRating ||
        isDeveloper !== initialState.isDeveloper;

    const handlePasswordUpdate = async () => {
        if (!newPassword) {
            alert("Please enter a new password.");
            return;
        }
        try {
            await AuthService.updatePassword(newPassword);
            showSuccess("Password updated successfully!");
            setShowPasswordChange(false);
            setOldPassword("");
            setNewPassword("");
        } catch (error: any) {
            console.error("Password update failed:", error);
            alert(error.message || "Failed to update password.");
        }
    };

    const handleSave = async () => {
        if (!userId || !hasChanges) return;
        setLoading(true);

        const backupProfile = { ...profile };

        try {
            let devStatus = isDeveloper;
            if (isDeveloper && !initialState.isDeveloper && inviteCode) {
                const isValid = await AuthService.validateInviteCode(inviteCode);
                if (!isValid) {
                    alert("Invalid invite code.");
                    setLoading(false);
                    return;
                }
                devStatus = true;
            } else if (isDeveloper && !initialState.isDeveloper && !inviteCode) {
                alert("Please enter an invite code.");
                setLoading(false);
                return;
            }

            const optimisticProfile = {
                ...profile,
                is_private_profile: !isPublicRating,
                app_role: devStatus ? 'dev' : 'user',
                updated_at: new Date().toISOString(),
            };
            setProfile(optimisticProfile);

            await AuthService.updateProfile(userId, {
                is_private_profile: !isPublicRating,
                app_role: devStatus ? 'dev' : 'user',
                updated_at: new Date().toISOString(),
            });

            setInitialState({
                isPublicRating,
                isDeveloper: devStatus,
            });

            showSuccess("Settings saved successfully!");
            navigate(-1);
        } catch (error: any) {
            console.error("Settings save failed:", error);
            alert(error.message || "Failed to save settings.");
            setProfile(backupProfile);
        } finally {
            setLoading(false);
        }
    };

    return {
        isPublicRating, setIsPublicRating,
        isDeveloper, setIsDeveloper,
        inviteCode, setInviteCode,
        showPasswordChange, setShowPasswordChange,
        oldPassword, setOldPassword,
        newPassword, setNewPassword,
        loading,
        initializing,
        initialState,
        hasChanges,
        handlePasswordUpdate,
        handleSave,
        navigate,
    };
};
