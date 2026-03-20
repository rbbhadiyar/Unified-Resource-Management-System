import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (role: string) => {
    localStorage.setItem("role", role);

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>

      <button onClick={() => handleLogin("user")}>
        Login as User
      </button>

      <br /><br />

      <button onClick={() => handleLogin("admin")}>
        Login as Admin
      </button>
    </div>
  );
};

export default Login;