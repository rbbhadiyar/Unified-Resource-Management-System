import Layout from "../../components/layout/UserLayout";

function ChangePassword() {
  return (
    <Layout>
      <div className="page-header">
        <h1>Change Password</h1>
        <p>Update your login credentials.</p>
      </div>
      <div className="panel" style={{ padding: 24, maxWidth: 480 }}>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Old Password</label>
          <input type="password" className="form-input" placeholder="••••••••" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">New Password</label>
          <input type="password" className="form-input" placeholder="••••••••" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Confirm New Password</label>
          <input type="password" className="form-input" placeholder="••••••••" />
        </div>
        <button className="btn-primary">Update Password</button>
      </div>
    </Layout>
  );
}

export default ChangePassword;
