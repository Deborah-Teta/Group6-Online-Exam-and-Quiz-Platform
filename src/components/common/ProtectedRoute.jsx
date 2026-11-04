import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "./Loader";

function ProtectedRoute({
  user,
  loading,
  allowedRoles = [],
}) {
  const location = useLocation();

  if (loading) {
    return <Loader message="Checking authentication..." fullScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
