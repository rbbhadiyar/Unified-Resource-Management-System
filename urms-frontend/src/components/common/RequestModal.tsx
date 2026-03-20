import { useState } from "react";
import { useToast } from "../../context/ToastContext";

interface RequestModalProps {
  resourceName: string;
  onClose: () => void;
}

const RequestModal = ({ resourceName, onClose }: RequestModalProps) => {
  const { showToast } = useToast();
  const [duration, setDuration] = useState("7 days");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onClose();
    showToast(`Request for "${resourceName}" submitted successfully!`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Request Resource</h3>

        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Resource</label>
          <input className="form-input" value={resourceName} readOnly />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Loan Duration</label>
          <select
            className="form-input"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option>7 days</option>
            <option>14 days</option>
            <option>30 days</option>
          </select>
        </div>

        <div style={{ marginBottom: 6 }}>
          <label className="form-label">Purpose / Notes</label>
          <input
            className="form-input"
            placeholder="e.g. Final year project work"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Submit Request</button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;