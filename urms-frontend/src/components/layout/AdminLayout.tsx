import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }: any) => {
  return (
    <div className="app-layout">

      <AdminSidebar />

      <div className="main-area">

        <div className="topbar">
          <div className="topbar-brand">Admin Dashboard</div>

          <div className="topbar-right">
            🔔
            <div className="user-avatar">AD</div>
          </div>
        </div>

        <div className="page-content">
          {children}
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;