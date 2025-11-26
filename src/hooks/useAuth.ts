import { useState, useEffect } from "react";
import { useLogin } from "../components/login/LoginProvider";
import { AuthService } from "../services/auth_services";

export function useAuth() {
    const { user } = useLogin();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            if (!user) {
                if (mounted) {
                    setProfile(null);
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                const data = await AuthService.getProfile(user.id);
                if (mounted) {
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [user]);

    return { user, profile, loading };
}
