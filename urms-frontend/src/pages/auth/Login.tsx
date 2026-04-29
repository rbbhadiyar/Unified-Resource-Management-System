import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import GoogleButton from "../../components/auth/GoogleButton";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/auth";
import { apiErrorMessage } from "../../utils/apiError";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginAs, setLoginAs] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await loginUser({ email: email.trim(), password });
      const role = data.role === "admin" ? "admin" : "user";

      if (loginAs === "admin" && role !== "admin") {
        setError("This account does not have admin access. Use Student / Staff sign-in, or sign in with an admin account.");
        setLoading(false);
        return;
      }
      if (loginAs === "user" && role === "admin") {
        setError("This is an admin account. Select Admin sign-in, or register a student/staff account.");
        setLoading(false);
        return;
      }

      login(
        {
          name: data.name,
          email: data.email,
          role,
          userId: data.user_id,
        },
        data.access_token
      );
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2>Welcome back</h2>
      <p className="auth-card-sub">Sign in to your URMS account</p>

      <div className="auth-role-toggle">
        <button
          type="button"
          className={`auth-role-btn${loginAs === "user" ? " active" : ""}`}
          onClick={() => setLoginAs("user")}
        >
          Student / Staff
        </button>
        <button
          type="button"
          className={`auth-role-btn${loginAs === "admin" ? " active" : ""}`}
          onClick={() => setLoginAs("admin")}
        >
          Admin
        </button>
      </div>

      {error && (
        <p style={{ color: "var(--danger, #b91c1c)", fontSize: 13, marginBottom: 8 }}>{error}</p>
      )}

      <div className="auth-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          className="form-input"
          placeholder="you@sitare.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="login-password">Password</label>
        <div className="auth-password-wrap">
          <input
            id="login-password"
            className="form-input"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2, marginBottom: 8 }}>
        <button type="button" className="auth-link" style={{ fontSize: 12 }} onClick={() => navigate("/forgot-password")}>
          Forgot password?
        </button>
      </div>

      <button
        className="btn-primary"
        style={{ width: "100%", marginTop: 4 }}
        type="button"
        onClick={() => void handleLogin()}
        disabled={loading}
      >
        {loading ? "Signing in…" : `Sign in as ${loginAs === "admin" ? "Admin" : "Student / Staff"}`}
      </button>

      <div className="auth-divider">or</div>

      <GoogleButton
        expectedPortal={loginAs}
        onSignedIn={() => {
          const u = JSON.parse(localStorage.getItem("user") || "{}") as { role?: string };
          if (u.role === "admin") navigate("/admin/dashboard");
          else navigate("/dashboard");
        }}
      />

      <p className="auth-footer-text">
        Don&apos;t have an account?{" "}
        <button className="auth-link" type="button" onClick={() => navigate("/register")}>
          Register
        </button>
      </p>
    </AuthLayout>
  );
};

export default Login;
