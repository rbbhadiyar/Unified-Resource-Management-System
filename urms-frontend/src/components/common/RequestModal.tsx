import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { triggerStatsRefresh } from "../../context/ShellStatsContext";
import { createRequest } from "../../api/requests";
import { apiErrorMessage } from "../../utils/apiError";

interface RequestModalProps {
  resourceId: number;
  resourceName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const LOAN_OPTIONS = [7, 14, 30];

const RequestModal = ({ resourceId, resourceName, onClose, onSuccess }: RequestModalProps) => {
  const { showToast } = useToast();
  const [loanDays, setLoanDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createRequest({
        resource_id: resourceId,
        loan_days: loanDays,
        notes: notes.trim() || undefined,
      });
      onClose();
      showToast(`Request for "${resourceName}" submitted.`);
      triggerStatsRefresh();
      onSuccess?.();
    } catch (e) {
      showToast(apiErrorMessage(e, "Request failed"));
    } finally {
      setSubmitting(false);
    }
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
          <label className="form-label">Loan duration (days)</label>
          <select
            className="form-input"
            value={loanDays}
            onChange={(e) => setLoanDays(Number(e.target.value))}
          >
            {LOAN_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
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
          <button type="button" className="btn-outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
