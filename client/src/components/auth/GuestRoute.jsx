import { Navigate } from "react-router-dom";
import { roleHomePaths } from "../../context/roleHomePaths";
import { useAuth } from "../../context/useAuth";

function GuestRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={roleHomePaths[user.role] || "/login"} replace />;
  }

  return children;
}

export default GuestRoute;
