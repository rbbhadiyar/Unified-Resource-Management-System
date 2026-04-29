import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ShellStatsProvider } from "./context/ShellStatsContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./context/ProtectedRoute";
import "./Landing.css";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import UserDashboard from "./pages/user/UserDashboard";
import BrowseResources from "./pages/user/BrowseResources";
import ResourceDetails from "./pages/user/ResourceDetails";
import MyResources from "./pages/user/MyResources";
import RequestHistory from "./pages/user/RequestHistory";
import Notifications from "./pages/user/Notifications";
import Profile from "./pages/user/Profile";
import Feedback from "./pages/user/Feedback";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResources from "./pages/admin/AdminResources";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminReturns from "./pages/admin/AdminReturns";
import Defaulters from "./pages/admin/Defaulters";
import AdminUsers from "./pages/admin/AdminUsers";
import Rules from "./pages/admin/Rules";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminProfile from "./pages/admin/AdminProfile";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ShellStatsProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
                <Route path="/resources" element={<ProtectedRoute role="user"><BrowseResources /></ProtectedRoute>} />
                <Route path="/resource/:id" element={<ProtectedRoute role="user"><ResourceDetails /></ProtectedRoute>} />
                <Route path="/my-resources" element={<ProtectedRoute role="user"><MyResources /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute role="user"><RequestHistory /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute role="user"><Notifications /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
                <Route path="/feedback" element={<ProtectedRoute role="user"><Feedback /></ProtectedRoute>} />

                <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/resources" element={<ProtectedRoute role="admin"><AdminResources /></ProtectedRoute>} />
                <Route path="/admin/requests" element={<ProtectedRoute role="admin"><AdminRequests /></ProtectedRoute>} />
                <Route path="/admin/returns" element={<ProtectedRoute role="admin"><AdminReturns /></ProtectedRoute>} />
                <Route path="/admin/defaulters" element={<ProtectedRoute role="admin"><Defaulters /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/rules" element={<ProtectedRoute role="admin"><Rules /></ProtectedRoute>} />
                <Route path="/admin/feedback" element={<ProtectedRoute role="admin"><AdminFeedback /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
              </Routes>
            </Router>
          </ToastProvider>
        </ShellStatsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
