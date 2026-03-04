import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

const AdminDashboard   = lazy(() => import("./pages/admin/AdminDashboard"));
const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));

export default function App() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/login"           element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/*"   element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/faculty/*" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/student/*" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}
