import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  createResource,
  deleteResource,
  getResourceTypes,
  getResources,
  updateResource,
} from "../../api/resources";
import type { ApiResource, ApiResourceType } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const AdminResources = () => {
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [types, setTypes] = useState<ApiResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type_id: "", qty: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [resR, resT] = await Promise.all([getResources(), getResourceTypes()]);
      setResources(Array.isArray(resR.data) ? resR.data : []);
      setTypes(Array.isArray(resT.data) ? resT.data : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.type_id || !form.qty) return;
    const typeId = Number(form.type_id);
    const qty = Number(form.qty);
    if (!Number.isFinite(typeId) || !Number.isFinite(qty) || qty < 0) return;
    setErr(null);
    try {
      if (editingId) {
        await updateResource(editingId, {
          resource_name: form.name.trim(),
          type_id: typeId,
          total_quantity: qty,
          description: form.description.trim() || null,
        });
      } else {
        await createResource({
          resource_name: form.name.trim(),
          type_id: typeId,
          total_quantity: qty,
          description: form.description.trim() || null,
        });
      }
      setForm({ name: "", type_id: "", qty: "", description: "" });
      setEditingId(null);
      await load();
    } catch (e) {
      setErr(apiErrorMessage(e, "Save failed"));
    }
  };

  const handleEdit = (res: ApiResource) => {
    setForm({
      name: res.resource_name,
      type_id: String(res.type_id),
      qty: String(res.total_quantity),
      description: res.description || "",
    });
    setEditingId(res.resource_id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this resource?")) return;
    setErr(null);
    try {
      await deleteResource(id);
      await load();
    } catch (e) {
      setErr(apiErrorMessage(e, "Delete failed"));
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Manage Resources</h1>
        <p>Add, edit and delete system resources</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div style={{ marginBottom: 16 }}>Loading…</div>}

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div className="panel-title">{editingId ? "Edit Resource" : "Add Resource"}</div>
        </div>
        <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <input
            className="form-input"
            placeholder="Resource Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ minWidth: 160 }}
          />
          <select
            className="form-input"
            value={form.type_id}
            onChange={(e) => setForm({ ...form, type_id: e.target.value })}
            style={{ minWidth: 140 }}
          >
            <option value="">Type</option>
            {types.map((t) => (
              <option key={t.type_id} value={t.type_id}>
                {t.type_name}
              </option>
            ))}
          </select>
          <input
            className="form-input"
            type="number"
            min={0}
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
            style={{ width: 120 }}
          />
          <input
            className="form-input"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ minWidth: 200, flex: 1 }}
          />
          <button type="button" className="btn-primary" onClick={() => void handleSubmit()}>
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", type_id: "", qty: "", description: "" });
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </div>

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
                <th>Available</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((res) => (
                <tr key={res.resource_id}>
                  <td>{res.resource_name}</td>
                  <td>{res.type_name || res.type_id}</td>
                  <td>{res.available_quantity}</td>
                  <td>{res.total_quantity}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button type="button" className="btn-sm btn-outline" onClick={() => handleEdit(res)}>
                      Edit
                    </button>
                    <button type="button" className="btn-sm btn-outline" onClick={() => void handleDelete(res.resource_id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminResources;
