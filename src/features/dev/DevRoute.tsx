import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

interface DevRouteProps {
    children: React.ReactNode;
}

const DevRoute = ({ children }: DevRouteProps) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#121212]">
                <LoadingSpinner className="w-10 h-10 text-[#f8baba]" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (profile?.app_role !== 'dev') {
        return <Navigate to="/" replace />; // Or /not-authorized
    }

    return <>{children}</>;
};

export default DevRoute;
