import { useState } from "react";
import AvailabilityDashboard from "../components/AvailabilityDashboard";
import { post } from "../api/client";

export default function UserAvailability() {
  const [callType, setCallType] = useState("resume_revamp");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitCallRequest = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setStatus("Submitting request...");
      await post("/api/call-requests", { call_type: callType, description });
      setStatus("Success. Request submitted.");
      setDescription("");
      setTimeout(() => setStatus(""), 4000);
    } catch (error) {
      setStatus("Error: Could not submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl mq-heading font-semibold text-ink">User Dashboard</h1>
        <p className="text-sm text-ink-muted mt-1">Manage your availability and request mentoring sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <AvailabilityDashboard role="user" />
        </div>
        
        {/* Request Call Form */}
        <div className="mq-card p-6 sticky top-8">
          <div className="mb-6">
            <h2 className="text-lg mq-heading font-semibold">Request a Call</h2>
            <p className="text-sm text-ink-muted mt-1">Submit a request to be matched with a mentor.</p>
          </div>
          
          <form onSubmit={submitCallRequest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Call Type</label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
                className="mq-input"
              >
                <option value="resume_revamp">Resume Revamp</option>
                <option value="job_market_guidance">Job Market Guidance</option>
                <option value="mock_interview">Mock Interview</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mq-input h-32 resize-none"
                placeholder="Detail the specific advice or guidance you are seeking..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="mq-btn-primary w-full mt-2"
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
            </button>
            
            {status && (
              <div className={`mt-4 text-sm font-medium ${status.includes("Error") ? 'text-danger' : 'text-teal'}`}>
                {status}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
