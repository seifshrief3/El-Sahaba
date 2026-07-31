import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const roleHomePages = {
  customer_service: "/customer_service",
  planning: "/planning",
  shipping: "/shipping",
  management: "/managments",
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // غير مسجل دخول
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // المستخدم داخل قسم غير مسموح له
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleHomePages[role]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
