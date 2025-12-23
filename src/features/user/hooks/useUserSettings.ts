import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../auth/services/auth_services";
import { useLogin } from "../../auth/components/LoginProvider";
import { useSuccess } from "../../../context/SuccessContext";
import { useError } from "../../../context/ErrorContext";
import { useConfirmation } from "../../../context/ConfirmationContext";

export const useUserSettings = () => {
    const navigate = useNavigate();
    const { showSuccess } = useSuccess();
    const { showError } = useError();
    const { showConfirmation } = useConfirmation();
    const { profile, setProfile } = useLogin();

    const [userId, setUserId] = useState<string | null>(null);
    const [isPublicRating, setIsPublicRating] = useState(false);
    const [isDeveloper, setIsDeveloper] = useState(false);
    const [inviteCode, setInviteCode] = useState("");

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
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
            showError("Please enter a new password.");
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
            showError(error.message || "Failed to update password.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!userId) return;

        const confirmed = await showConfirmation({
            title: 'Delete Your Account',
            message: 'Are you sure you want to delete your account? This will permanently remove all your data including playlists, ratings, comments, and favorites. This action cannot be undone.',
            confirmText: 'Delete My Account',
            variant: 'danger'
        });

        if (!confirmed) return;

        setDeletingAccount(true);
        try {
            const { supabase } = await import('../../../lib/supabaseClient');
            const { error } = await (supabase.rpc as any)('delete_user_completely', { target_user_id: userId });

            if (error) {
                console.error('Error deleting account:', error);
                showError('Failed to delete account. Please try again.');
                return;
            }

            // Sign out and redirect
            await supabase.auth.signOut();
            showSuccess('Your account has been deleted.');
            navigate('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            showError('Failed to delete account. Please try again.');
        } finally {
            setDeletingAccount(false);
        }
    };

    const handleSave = async () => {
        if (!userId || !hasChanges) return;
        setLoading(true);

        const backupProfile = { ...profile };

        try {
            let devStatus = isDeveloper;

            // Use RPC function to verify and set dev role
            if (isDeveloper && !initialState.isDeveloper && inviteCode) {
                const { supabase } = await import('../../../lib/supabaseClient');
                const { data, error } = await (supabase.rpc as any)('verify_and_set_dev_role', { dev_code: inviteCode });

                if (error) {
                    console.error('RPC error:', error);
                    showError("Failed to verify code.");
                    setLoading(false);
                    return;
                }

                if (!data?.success) {
                    showError("Invalid invite code.");
                    setLoading(false);
                    return;
                }

                // Refresh session to get new JWT with updated app_metadata
                await supabase.auth.refreshSession();
                devStatus = true;
            } else if (isDeveloper && !initialState.isDeveloper && !inviteCode) {
                showError("Please enter an invite code.");
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

            // Sync role to Auth User Metadata (CRITICAL for RLS) - skip if dev was just set via RPC
            if (!(isDeveloper && !initialState.isDeveloper && inviteCode)) {
                await AuthService.updateAuthMetadata({
                    app_role: devStatus ? 'dev' : 'user'
                });
            }

            setInitialState({
                isPublicRating,
                isDeveloper: devStatus,
            });

            showSuccess("Settings saved successfully!");
            navigate(-1);
        } catch (error: any) {
            console.error("Settings save failed:", error);
            showError(error.message || "Failed to save settings.");
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
        deletingAccount,
        initializing,
        initialState,
        hasChanges,
        handlePasswordUpdate,
        handleDeleteAccount,
        handleSave,
        navigate,
    };
};

