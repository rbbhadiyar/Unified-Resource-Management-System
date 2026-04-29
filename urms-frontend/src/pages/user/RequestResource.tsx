import Layout from "../../components/layout/UserLayout";

function RequestResource() {
  return (
    <Layout>
      <div className="page-header">
        <h1>Request Resource</h1>
        <p>Fill in the details to submit a resource request.</p>
      </div>
      <div className="panel" style={{ padding: 24, maxWidth: 480 }}>
        <div className="auth-field" style={{ marginBottom: 16 }}>
          <label className="form-label">From Date</label>
          <input type="date" className="form-input" />
        </div>
        <div className="auth-field" style={{ marginBottom: 20 }}>
          <label className="form-label">To Date</label>
          <input type="date" className="form-input" />
        </div>
        <button className="btn-primary">Submit Request</button>
      </div>
    </Layout>
  );
}

export default RequestResource;
