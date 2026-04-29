import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { resetPassword } from "../../api/auth";
import { apiErrorMessage } from "../../utils/apiError";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token")?.trim() || "", [params]);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (!token) {
      setError("Reset token is missing. Please open the link from your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, new_password: password });
      setDone(true);
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "Could not reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2>Reset password</h2>
      <p className="auth-card-sub">Set a new password for your account.</p>

      {error ? <p style={{ color: "var(--danger)", marginBottom: 10 }}>{error}</p> : null}

      {done ? (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
            Password updated successfully. You can sign in now.
          </p>
          <button className="btn-primary" style={{ width: "100%" }} type="button" onClick={() => navigate("/login")}>
            Go to sign in
          </button>
        </>
      ) : (
        <>
          <div className="auth-field">
            <label htmlFor="new-password">New password</label>
            <div className="auth-password-wrap">
              <input
                id="new-password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
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
          <button className="btn-primary" type="button" style={{ width: "100%" }} onClick={() => void submit()} disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;