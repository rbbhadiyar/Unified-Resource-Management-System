import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../api/auth";
import { apiErrorMessage } from "../../utils/apiError";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    year_of_study: "",
    roll_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError(null);
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError("Name, email, and password (min 6 chars) are required.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        department: form.department.trim() || undefined,
        year_of_study: form.year_of_study.trim() || undefined,
        roll_number: form.roll_number.trim() || undefined,
      });
      const role = data.role === "admin" ? "admin" : "user";
      login(
        {
          name: data.name,
          email: data.email,
          role,
          userId: data.user_id,
        },
        data.access_token
      );
      navigate("/dashboard");
    } catch (e: unknown) {
      setError(apiErrorMessage(e, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2>Create account</h2>
      <p className="auth-card-sub">Join your institution on URMS — same details appear on your profile.</p>

      {error && (
        <p style={{ color: "var(--danger, #b91c1c)", fontSize: 13, marginBottom: 8 }}>{error}</p>
      )}

      <div className="auth-field">
        <label>Full name</label>
        <input className="form-input" placeholder="Ram Bhanwar" onChange={(e) => set("name", e.target.value)} value={form.name} />
      </div>

      <div className="auth-field">
        <label>Email</label>
        <input
          className="form-input"
          placeholder="you@sitare.edu"
          onChange={(e) => set("email", e.target.value)}
          value={form.email}
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label>Password</label>
        <div className="auth-password-wrap">
          <input
            className="form-input"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            onChange={(e) => set("password", e.target.value)}
            value={form.password}
            autoComplete="new-password"
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

      <div className="auth-field">
        <label>Phone (optional)</label>
        <input className="form-input" placeholder="+91 98545 49812" onChange={(e) => set("phone", e.target.value)} value={form.phone} />
      </div>

      <div className="auth-field">
        <label>University / department (optional)</label>
        <input
          className="form-input"
          placeholder="e.g. Sitare University, Computer Science"
          onChange={(e) => set("department", e.target.value)}
          value={form.department}
        />
      </div>

      <div className="auth-field">
        <label>Year of study (optional)</label>
        <input className="form-input" placeholder="e.g. 2nd Year, M.Tech Y1" onChange={(e) => set("year_of_study", e.target.value)} value={form.year_of_study} />
      </div>

      <div className="auth-field">
        <label>Roll / enrolment no. (optional)</label>
        <input className="form-input" placeholder="e.g. CS-22041" onChange={(e) => set("roll_number", e.target.value)} value={form.roll_number} />
      </div>

      <button
        className="btn-primary"
        style={{ width: "100%", marginTop: 4 }}
        type="button"
        onClick={() => void submit()}
        disabled={loading}
      >
        {loading ? "Creating…" : "Create account"}
      </button>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <button className="auth-link" type="button" onClick={() => navigate("/login")}>
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
};

export default Register;
