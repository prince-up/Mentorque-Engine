import { useState, useEffect } from "react";
import AvailabilityDashboard from "../components/AvailabilityDashboard";
import { post, get, put } from "../api/client";
import BookingsList from "../components/BookingsList";

export default function UserAvailability() {
  const [callType, setCallType] = useState("resume_revamp");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [profile, setProfile] = useState({ tags: "", description: "" });
  const [profileSaveStatus, setProfileSaveStatus] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await get("/api/profile");
      setProfile({
        tags: data.tags ? data.tags.join(", ") : "",
        description: data.description || ""
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveStatus("Saving...");
    try {
      const tagsArray = profile.tags.split(",").map(t => t.trim()).filter(Boolean);
      await put("/api/profile", {
        tags: tagsArray,
        description: profile.description
      });
      setProfileSaveStatus("Profile saved successfully.");
      setTimeout(() => setProfileSaveStatus(""), 4000);
    } catch (err) {
      setProfileSaveStatus("Error saving profile.");
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await get("/api/bookings");
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

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
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl mq-heading font-semibold text-ink mb-4">Your Schedule</h2>
            <AvailabilityDashboard role="user" />
          </div>
          <div>
            <h2 className="text-xl mq-heading font-semibold text-ink mb-4">Scheduled Calls</h2>
            {loadingBookings ? (
              <div className="text-sm text-ink-muted">Loading bookings...</div>
            ) : (
              <BookingsList 
                bookings={bookings} 
                role="user" 
                emptyMessage="No calls scheduled yet. Once an admin books you with a mentor, it'll show up here." 
              />
            )}
          </div>
        </div>
        
        {/* Right Column: Profile & Request */}
        <div className="space-y-8 sticky top-8">
          <div className="mq-card p-6">
            <div className="mb-6">
              <h2 className="text-lg mq-heading font-semibold">Your Profile</h2>
              <p className="text-sm text-ink-muted mt-1">Update your tags and description.</p>
            </div>
            {loadingProfile ? (
              <div className="text-sm text-ink-muted">Loading profile...</div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={profile.tags}
                    onChange={e => setProfile({...profile, tags: e.target.value})}
                    className="mq-input w-full"
                    placeholder="e.g. tech, good communication"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Description</label>
                  <textarea
                    value={profile.description}
                    onChange={e => setProfile({...profile, description: e.target.value})}
                    className="mq-input w-full h-24 resize-none"
                  />
                </div>
                <button type="submit" className="mq-btn-secondary w-full mt-2">Save Profile</button>
                {profileSaveStatus && (
                  <div className={`mt-2 text-sm font-medium ${profileSaveStatus.includes("Error") ? 'text-danger' : 'text-teal'}`}>
                    {profileSaveStatus}
                  </div>
                )}
              </form>
            )}
          </div>

          <div className="mq-card p-6">
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
    </div>
  );
}
