import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import UserAvailability from "./pages/UserAvailability";
import MentorAvailability from "./pages/MentorAvailability";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminSchedules from "./pages/AdminSchedules";

const WELCOME_PATH = "/welcome";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const welcomeTo = location.search ? `${WELCOME_PATH}${location.search}` : WELCOME_PATH;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={welcomeTo} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function DefaultRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const welcomeTo = location.search ? `${WELCOME_PATH}${location.search}` : WELCOME_PATH;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to={welcomeTo} replace />;
  if (user.role === "mentor") return <Navigate to="/mentor" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/availability" replace />;
}

function NormalizePathname({ children }) {
  const location = useLocation();
  const pathname = location.pathname;
  if (pathname.startsWith("//")) {
    const fixed = pathname.replace(/\/+/g, "/") + location.search;
    return <Navigate to={fixed} replace />;
  }
  return children;
}

export default function App() {
  return (
    <NormalizePathname>
      <Routes>
        <Route path={WELCOME_PATH} element={<Welcome />} />
        <Route path="/login/user" element={<Login role="user" />} />
        <Route path="/login/mentor" element={<Login role="mentor" />} />
        <Route path="/login/admin" element={<Login role="admin" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DefaultRedirect />} />
        <Route
          path="availability"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="mentor"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/schedules"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSchedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </NormalizePathname>
  );
}
