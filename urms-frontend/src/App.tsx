import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";

// USER
import UserDashboard from "./pages/user/UserDashboard";
import BrowseResources from "./pages/user/BrowseResources";
import ResourceDetails from "./pages/user/ResourceDetails";
import MyResources from "./pages/user/MyResources";
import RequestHistory from "./pages/user/RequestHistory";
import Notifications from "./pages/user/Notifications";
import Profile from "./pages/user/Profile";

// ADMIN

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResources from "./pages/admin/AdminResources";
import AdminRequests from "./pages/admin/AdminRequests";
import Defaulters from "./pages/admin/Defaulters";
import AdminUsers from "./pages/admin/AdminUsers";

// 🔐 Fake auth (we’ll improve later)
const getRole = () => localStorage.getItem("role");

const ProtectedRoute = ({ children, role }: any) => {
  const userRole = getRole();

  if (!userRole) return <Navigate to="/" />;
  if (role && userRole !== role) return <Navigate to="/" />;

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* USER ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/resources" element={<BrowseResources />} />
        <Route path="/resource/:id" element={<ResourceDetails />} />
        <Route path="/my-resources" element={<MyResources />} />
        <Route path="/requests" element={<RequestHistory />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute role="admin">
              <AdminResources />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute role="admin">
              <AdminRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/defaulters"
          element={
            <ProtectedRoute role="admin">
              <Defaulters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default App;