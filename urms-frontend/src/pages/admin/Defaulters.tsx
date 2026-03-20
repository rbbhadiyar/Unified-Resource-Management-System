import AdminLayout from "../../components/layout/AdminLayout";

const Defaulters = () => {
  return (
    <AdminLayout>

      <div className="page-header">
        <h1>Defaulters</h1>
        <p>Users with overdue resources or unpaid fines</p>
      </div>

      <div className="panel">

        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Fine</th>
              <th>Overdue Days</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>Rohan</td>
              <td>₹500</td>
              <td>5</td>
            </tr>

          </tbody>

        </table>

      </div>

    </AdminLayout>
  );
};

export default Defaulters;