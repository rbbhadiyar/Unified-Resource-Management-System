import AdminLayout from "../../components/layout/AdminLayout";

const AdminRequests = () => {
  return (
    <AdminLayout>

      <div className="page-header">
        <h1>Requests</h1>
        <p>Approve or reject user requests</p>
      </div>

      <div className="panel">

        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Resource</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>Rohan</td>
              <td>Laptop</td>
              <td>Today</td>
              <td><span className="status-pill pending">Pending</span></td>
              <td>
                <button className="btn-primary btn-sm">Approve</button>
                <button className="btn-outline btn-sm">Reject</button>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </AdminLayout>
  );
};

export default AdminRequests;