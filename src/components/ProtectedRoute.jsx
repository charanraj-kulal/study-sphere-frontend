// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../UserContext";

const ProtectedRoute = () => {
  const { userData } = useUser();

  if (!userData) {
    // Redirect them to the /login page if there is no user data
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
