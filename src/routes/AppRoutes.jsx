import { Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "../pages/admin/Dashboard";
import CompanyData from "../pages/admin/CompanyData";
import CompanyUsers from "../pages/admin/CompanyUsers";
import Questions from "../pages/admin/Questions";
import Sessions from "../pages/admin/Sessions";
import Login from "../pages/auth/Login";
import Profile from "../pages/common/Profile";
import UserDashboard from "../pages/user/Dashboard";
import { getRole, isAuthenticated } from "../utils/roleHelper";

function ProtectedRoute({ children, allowedRole }) {
  const role = getRole();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    const fallback = role === "user" ? "/user/dashboard" : "/admin/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default function AppRoutes() {
  const role = getRole();
  const authenticated = isAuthenticated();
  const fallback = role === "user" ? "/user/dashboard" : "/admin/dashboard";

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={authenticated ? fallback : "/login"} replace />}
      />
      <Route
        path="/login"
        element={authenticated ? <Navigate to={fallback} replace /> : <Login />}
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-data"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-users"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <Questions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute allowedRole="admin">
            <Sessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={authenticated ? fallback : "/login"} replace />}
      />
    </Routes>
  );
}
