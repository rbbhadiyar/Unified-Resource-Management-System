import { useState } from "react";
import Sidebar from "../../components/layout/AdminSidebar";
import Topbar from "../../components/layout/Topbar";

const AdminUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Rahul", role: "user", status: "active" },
    { id: 2, name: "Anjali", role: "user", status: "blocked" },
  ]);

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "blocked" : "active" }
          : u
      )
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar title="User Management" />

        <div className="page-content">
          <div className="page-header">
            <h1>User Management</h1>
            <p>Control user access and roles</p>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">All Users</div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.role}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            u.status === "active"
                              ? "approved"
                              : "overdue"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => toggleStatus(u.id)}
                        >
                          {u.status === "active"
                            ? "Block"
                            : "Unblock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminUsers;