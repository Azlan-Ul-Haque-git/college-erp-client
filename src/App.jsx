import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Register from "./pages/auth/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

import ProfileSettings from "./pages/ProfileSettings";
import IDCard from "./pages/IDCard";
import DownloadApp from "./pages/DownloadApp";

/* ADMIN */
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

/* FACULTY */
const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));

/* STUDENT */
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));

export default function App() {

  const { user } = useAuth();

  return (

    <Suspense fallback={<Loader />}>

      <Routes>

        {/* AUTH */}

        <Route
          path="/login"
          element={
            !user
              ? <Login />
              : <Navigate to={`/${user.role}/dashboard`} />
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= FACULTY ================= */}

        <Route
          path="/faculty/*"
          element={
            <ProtectedRoute role="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT ================= */}

        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* SHARED */}

        <Route
          path="/profile"
          element={
            user
              ? <ProfileSettings />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/idcard"
          element={
            user
              ? <IDCard />
              : <Navigate to="/login" />
          }
        />

        {/* DEFAULT */}

        <Route
          path="*"
          element={<Navigate to="/login" />}
        />
        <Route path="/download-app" element={<DownloadApp />} />

      </Routes>

    </Suspense>
  );
}