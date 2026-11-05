import { Navigate, Outlet, useLocation } from "react-router-dom";
import { roleHomePaths } from "../../context/roleHomePaths";
import { useAuth } from "../../context/useAuth";

function ProtectedRoute({ allowedRoles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={roleHomePaths[user.role] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
