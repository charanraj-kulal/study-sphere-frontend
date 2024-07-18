// src/components/DashboardRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const { userData } = useUser();

  useEffect(() => {
    switch (userData.userRole) {
      case 1:
        navigate("/dashboard/dashboard");
        break;
      case 2:
        navigate("/dashboard/verify");
        break;
      case 3:
        navigate("/dashboard/upload");
        break;
      default:
        navigate("/dashboard");
    }
  }, [userData.userRole, navigate]);

  return null; // This component doesn't render anything
};

export default DashboardRedirect;
