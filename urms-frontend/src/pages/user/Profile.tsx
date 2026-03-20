import { useState } from "react";
import Layout from "../../components/layout/UserLayout";
import { useToast } from "../../context/ToastContext";

interface ProfileField {
  label: string;
  value: string;
  editable?: boolean;
}

const personalInfo: ProfileField[] = [
  { label: "Full Name", value: "Ram Bhanwar Bhadiyar", editable: true },
  { label: "Email", value: "su-23030@sitare.org", editable: true },
  { label: "Phone", value: "+91 9854549812", editable: true },
  { label: "Department", value: "Computer Science & Engineering" },
  { label: "Year", value: "3rd Year" },
  { label: "Roll Number", value: "CS-22041" },
];

const accountSummary: ProfileField[] = [
  { label: "Active Resources", value: "3" },
  { label: "Total Borrowed", value: "12" },
  { label: "Resources Returned", value: "9" },
  { label: "Outstanding Fine", value: "₹200" },
  { label: "Member Since", value: "August 2022" },
];

const Profile = () => {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
    showToast("Profile updated successfully.");
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your personal information and account settings.</p>
      </div>

      <div className="profile-wrap">
        {/* Header */}
        <div className="profile-header-card">
          <div className="profile-avatar">RB</div>
          <div>
            <div className="profile-name">Ram Bhanwar Bhadiyar</div>
            <div className="profile-role">B.Tech · Computer Science · Year 3</div>
            <div className="profile-id">ID: 202310101200031</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {editing ? (
              <>
                <button
                  className="btn-outline"
                  onClick={() => setEditing(false)}
                  style={{ fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  style={{ fontSize: 13 }}
                >
                  Save
                </button>
              </>
            ) : (
              <button
                className="btn-primary"
                onClick={() => setEditing(true)}
                style={{ fontSize: 13 }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div className="profile-section">
          <div className="profile-section-title">Personal Information</div>
          {personalInfo.map((field) => (
            <div key={field.label} className="profile-row">
              <div className="profile-key">{field.label}</div>
              {editing && field.editable ? (
                <input
                  className="form-input"
                  defaultValue={field.value}
                  style={{ maxWidth: 300 }}
                />
              ) : (
                <div className="profile-val">{field.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Account Summary */}
        <div className="profile-section">
          <div className="profile-section-title">Account Summary</div>
          {accountSummary.map((field) => (
            <div key={field.label} className="profile-row">
              <div className="profile-key">{field.label}</div>
              <div
                className="profile-val"
                style={{
                  color:
                    field.label === "Outstanding Fine"
                      ? "var(--danger)"
                      : "var(--text)",
                  fontWeight: field.label === "Outstanding Fine" ? 500 : 400,
                }}
              >
                {field.value}
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="profile-section">
          <div className="profile-section-title">Account Actions</div>
          <div className="profile-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
              Change Password
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Update your login credentials.
            </div>
            <button
              className="btn-outline"
              style={{ fontSize: 12, marginTop: 4 }}
              onClick={() => showToast("Password reset email sent.")}
            >
              Send Reset Email
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;