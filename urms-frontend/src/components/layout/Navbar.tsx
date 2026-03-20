const Navbar = () => {
  const role = localStorage.getItem("role");

  return (
    <div className="topbar">
      <div className="topbar-brand">
        {role === "admin" ? "Admin Panel" : "User Panel"}
      </div>

      <div className="topbar-right">
        <button
          className="btn-outline"
          onClick={() => {
            localStorage.removeItem("role");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;