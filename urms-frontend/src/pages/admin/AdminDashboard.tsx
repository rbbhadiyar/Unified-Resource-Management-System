import Sidebar from "../../components/layout/AdminSidebar";
import Topbar from "../../components/layout/Topbar";

const StatCard = ({ title, value }: any) => (
  <div className="stat-card">
    <div className="stat-label">{title}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-sub">Updated just now</div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Topbar title="Admin Dashboard" />

        <div className="page-content">
          {/* Header */}
          <div className="page-header">
            <h1>Admin Dashboard</h1>
            <p>Overview of system activity and controls</p>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard title="Total Users" value="1,245" />
            <StatCard title="Resources" value="320" />
            <StatCard title="Active Requests" value="58" />
            <StatCard title="Defaulters" value="12" />
          </div>

          {/* Main Grid */}
          <div className="dash-grid">
            
            {/* Recent Requests */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Recent Requests</div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Resource</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Rahul Sharma</td>
                      <td>Laptop</td>
                      <td><span className="status-pill pending">Pending</span></td>
                      <td>20 Mar</td>
                    </tr>
                    <tr>
                      <td>Anjali Verma</td>
                      <td>Projector</td>
                      <td><span className="status-pill approved">Approved</span></td>
                      <td>19 Mar</td>
                    </tr>
                    <tr>
                      <td>Rohit Singh</td>
                      <td>Book Set</td>
                      <td><span className="status-pill issued">Issued</span></td>
                      <td>18 Mar</td>
                    </tr>
                    <tr>
                      <td>Neha Jain</td>
                      <td>Tablet</td>
                      <td><span className="status-pill overdue">Overdue</span></td>
                      <td>16 Mar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Quick Actions</div>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <button className="btn-primary">+ Add Resource</button>
                <button className="btn-outline">Manage Users</button>
                <button className="btn-outline">View Requests</button>
                <button className="btn-outline">Check Defaulters</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;