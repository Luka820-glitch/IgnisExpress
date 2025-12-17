import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { Navigate } from "react-router-dom";

const DashboardRedirect: React.FC = () => {
  const { role, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  switch (role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "courier":
      return <Navigate to="/courier" replace />;
    case "user":
      return <Navigate to="/user" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};
export default DashboardRedirect;
