import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminDashboard from "../pages/admin/Dashboard";
import CompanyData from "../pages/admin/CompanyData";
import CompanyDataForm from "../pages/admin/CompanyDataForm";
import CompanyDataView from "../pages/admin/CompanyDataView";
import CompanyUsers from "../pages/admin/CompanyUsers";
import CompanyUsersForm from "../pages/admin/CompanyUsersForm";
import CompanyUsersView from "../pages/admin/CompanyUsersView";
import Questions from "../pages/admin/Questions";
import QuestionsForm from "../pages/admin/QuestionsForm";
import QuestionsView from "../pages/admin/QuestionsView";
import Sessions from "../pages/admin/Sessions";
import Themes from "../pages/admin/Themes";
import ThemeForm from "../pages/admin/ThemeForm";
import ThemeView from "../pages/admin/ThemeView";
import Kpis from "../pages/admin/Kpis";
import KpiForm from "../pages/admin/KpiForm";
import KpiView from "../pages/admin/KpiView";
import Login from "../pages/auth/Login";
import Profile from "../pages/common/Profile";
import SessionForm from "../pages/common/SessionForm";
import UserDashboard from "../pages/user/Dashboard";

function ProtectedRoute({ children, allowedRole }) {
  const role = useSelector((state) => state.auth.role);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);

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
  const role = useSelector((state) => state.auth.role);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
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
        path="/admin/company-data/add"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyDataForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-data/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyDataView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-data/:id/edit"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyDataForm mode="edit" />
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
        path="/admin/company-users/add"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyUsersForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-users/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyUsersView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-users/:id/edit"
        element={
          <ProtectedRoute allowedRole="admin">
            <CompanyUsersForm mode="edit" />
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
        path="/admin/questions/add"
        element={
          <ProtectedRoute allowedRole="admin">
            <QuestionsForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <QuestionsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions/:id/edit"
        element={
          <ProtectedRoute allowedRole="admin">
            <QuestionsForm mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/themes"
        element={
          <ProtectedRoute allowedRole="admin">
            <Themes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/themes/add"
        element={
          <ProtectedRoute allowedRole="admin">
            <ThemeForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/themes/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <ThemeView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/themes/:id/edit"
        element={
          <ProtectedRoute allowedRole="admin">
            <ThemeForm mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kpis"
        element={
          <ProtectedRoute allowedRole="admin">
            <Kpis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kpis/add"
        element={
          <ProtectedRoute allowedRole="admin">
            <KpiForm mode="add" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kpis/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <KpiView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kpis/:id/edit"
        element={
          <ProtectedRoute allowedRole="admin">
            <KpiForm mode="edit" />
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
        path="/sessions/:id/form"
        element={
          <ProtectedRoute>
            <SessionForm />
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
