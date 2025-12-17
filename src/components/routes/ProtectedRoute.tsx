import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}> = ({ children, requiredRole, fallbackPath = "/" }) => {
  const { isAuthenticated, role } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
