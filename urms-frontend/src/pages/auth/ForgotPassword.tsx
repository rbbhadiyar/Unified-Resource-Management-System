import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { forgotPassword } from "../../api/auth";
import { apiErrorMessage } from "../../utils/apiError";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email: trimmed });
      setSubmitted(true);
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "Could not send reset email."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2>Forgot password</h2>
      <p className="auth-card-sub">Enter your account email and we will send a reset link.</p>

      {error ? <p style={{ color: "var(--danger)", marginBottom: 10 }}>{error}</p> : null}

      {submitted ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          If an account exists for this email, reset instructions have been sent.
        </p>
      ) : (
        <>
          <div className="auth-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              className="form-input"
              placeholder="you@sitare.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button className="btn-primary" type="button" style={{ width: "100%" }} onClick={() => void submit()} disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </>
      )}

      <p className="auth-footer-text">
        <button className="auth-link" type="button" onClick={() => navigate("/login")}>
          Back to sign in
        </button>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;