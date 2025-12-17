import { Navigate, Route, Routes } from "react-router-dom";
import RegistrationForm from "../forms/RegistrationForm";
import Login from "../auth/Login";
import AdminDashboard from "../dashboard/AdminDashboard";
import DashboardRedirect from "../DashboardRedirect";
import LandingPage from "../LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import UserDashboard from "../dashboard/UserDashboard";
import CourierDashboard from "../dashboard/CourierDashboard";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationForm />} />

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/*"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courier/*"
        element={
          <ProtectedRoute requiredRole="courier">
            <CourierDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
