import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

import AdminDashboard from "../pages/admin/Dashboard";
import CompanyData from "../pages/admin/CompanyData";
import CompanyUsers from "../pages/admin/CompanyUsers";
import Questions from "../pages/admin/Questions";
import Sessions from "../pages/admin/Sessions";
import UserDashboard from "../pages/user/Dashboard";
import { getRole } from "../utils/roleHelper";

export default function AppRoutes() {
  const role = getRole() || "admin";
  const fallback = role === "user" ? "/user/dashboard" : "/admin/dashboard";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={fallback} replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/company-data" element={<CompanyData />} />
      <Route path="/admin/company-users" element={<CompanyUsers />} />
      <Route path="/admin/questions" element={<Questions />} />
      <Route path="/admin/sessions" element={<Sessions />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="*" element={<Navigate to={fallback} replace />} />
    </Routes>
  );
}
