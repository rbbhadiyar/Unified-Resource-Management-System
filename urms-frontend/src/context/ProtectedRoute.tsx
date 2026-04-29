import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // <-- fixed path

interface Props {
  role?: "admin" | "user";
  children: React.ReactElement; // <-- safer than JSX.Element
}

const ProtectedRoute = ({ children, role }: Props) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;