import { useState } from "react";
import Sidebar from "../../components/layout/AdminSidebar";
import Topbar from "../../components/layout/Topbar";

const AdminResources = () => {
  const [resources, setResources] = useState([
    { id: 1, name: "Laptop", type: "Hardware", qty: 10 },
    { id: 2, name: "Projector", type: "Hardware", qty: 5 },
  ]);

  const [form, setForm] = useState({ name: "", type: "", qty: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!form.name || !form.type || !form.qty) return;

    if (editingId) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, ...form, qty: Number(form.qty) } : r
        )
      );
      setEditingId(null);
    } else {
      setResources((prev) => [
        ...prev,
        { id: Date.now(), ...form, qty: Number(form.qty) },
      ]);
    }

    setForm({ name: "", type: "", qty: "" });
  };

  const handleEdit = (res: any) => {
    setForm({
      name: res.name,
      type: res.type,
      qty: String(res.qty),
    });
    setEditingId(res.id);
  };

  const handleDelete = (id: number) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar title="Manage Resources" />

        <div className="page-content">
          <div className="page-header">
            <h1>Manage Resources</h1>
            <p>Add, edit and delete system resources</p>
          </div>

          {/* FORM */}
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-title">
                {editingId ? "Edit Resource" : "Add Resource"}
              </div>
            </div>

            <div style={{ padding: 20, display: "flex", gap: 10 }}>
              <input
                className="form-input"
                placeholder="Resource Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <input
                className="form-input"
                placeholder="Type (Hardware/Book)"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              />
              <input
                className="form-input"
                type="number"
                placeholder="Quantity"
                value={form.qty}
                onChange={(e) =>
                  setForm({ ...form, qty: e.target.value })
                }
              />
              <button className="btn-primary" onClick={handleSubmit}>
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">All Resources</div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((res) => (
                    <tr key={res.id}>
                      <td>{res.name}</td>
                      <td>{res.type}</td>
                      <td>{res.qty}</td>
                      <td>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => handleEdit(res)}
                        >
                          Edit
                        </button>{" "}
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => handleDelete(res.id)}
                        >
                          Delete
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

export default AdminResources;