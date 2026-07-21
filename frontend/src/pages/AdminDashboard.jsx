import { useState, useEffect } from "react";
import { get, post } from "../api/client";
import BookingsList from "../components/BookingsList";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("");
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchRequests();
    } else {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await get("/api/bookings");
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await get("/api/call-requests/pending");
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRequest = async (req) => {
    setSelectedRequest(req);
    setRecommendations([]);
    setBookingStatus("");
    setLoadingRecs(true);
    try {
      const data = await get(`/api/call-requests/${req.id}/recommendations`);
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleBookCall = async (mentor, overlap, bookingKey) => {
    try {
      setActiveBookingId(bookingKey);
      setBookingStatus("Booking...");
      await post(`/api/call-requests/${selectedRequest.id}/book`, {
        mentor_id: mentor.id,
        scheduled_day: overlap.day_of_week,
        start_time: overlap.overlap_start,
        end_time: overlap.overlap_end
      });
      setBookingStatus("Booked successfully.");
      setSelectedRequest(null);
      fetchRequests(); 
    } catch (err) {
      setBookingStatus("Error: Could not book call.");
    } finally {
      setActiveBookingId(null);
    }
  };

  const formatCallType = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-6 flex-shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl mq-heading font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-ink-muted mt-1">Review pending call requests and manage scheduled sessions.</p>
        </div>
        <div className="flex bg-paper-subtle p-1 rounded-sm border border-border shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${activeTab === 'pending' ? 'bg-surface shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${activeTab === 'scheduled' ? 'bg-surface shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
          >
            Scheduled Sessions
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Pending Requests List */}
        <div className="w-1/3 flex flex-col bg-surface border border-border shadow-sm rounded-sm">
          <div className="p-4 border-b border-border bg-paper-subtle">
            <h2 className="mq-mono-label text-ink-muted">
              Pending Requests ({requests.length})
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto mq-scroll">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-ink-muted text-sm">
                No call requests pending.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {requests.map(req => (
                  <div 
                    key={req.id} 
                    className={`p-4 cursor-pointer transition-colors duration-150
                      ${selectedRequest?.id === req.id 
                        ? 'bg-teal-light border-l-2 border-l-teal' 
                        : 'bg-surface hover:bg-paper-subtle border-l-2 border-l-transparent'}`}
                    onClick={() => handleSelectRequest(req)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-ink">{req.user_name}</span>
                      <span className="mq-mono-label text-teal bg-teal-light px-2 py-0.5 rounded-sm">
                        {formatCallType(req.call_type)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{req.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Recommendations & Overlap */}
        <div className="w-2/3 flex flex-col bg-paper border border-border shadow-sm rounded-sm overflow-hidden relative">
          <div className="p-4 border-b border-border bg-surface">
            <h2 className="mq-mono-label text-ink-muted">
              Mentor Recommendations
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto mq-scroll p-6">
            {!selectedRequest ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-ink-muted text-sm">
                Select a request from the list to view RAG matches.
              </div>
            ) : loadingRecs ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-64 h-2 bg-border rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-teal transition-all duration-[1000ms] ease-out" style={{ width: '100%', animation: 'fillBar 1s ease-out' }}></div>
                  <style>{`@keyframes fillBar { from { width: 0%; } to { width: 100%; } }`}</style>
                </div>
                <p className="text-sm text-ink-muted">Generating vector embeddings...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recommendations.length === 0 ? (
                  <div className="p-4 bg-danger-light border border-danger/20 text-danger text-sm rounded-sm">
                    No suitable mentors found for this request.
                  </div>
                ) : (
                  recommendations.map((mentor, index) => (
                    <div key={mentor.id} className="bg-surface border border-border shadow-sm rounded-sm overflow-hidden">
                      <div className="p-5 border-b border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-ink flex items-center gap-2 mq-heading">
                              {mentor.name}
                              {index === 0 && <span className="bg-teal text-white text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-widest">Top Match</span>}
                            </h3>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-ink-muted mb-1">Match Score</div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-teal" style={{ width: `${mentor.score * 100}%` }}></div>
                              </div>
                              <span className="mq-mono-label text-ink">{(mentor.score * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-ink-muted leading-relaxed">"{mentor.explanation}"</p>
                      </div>

                      <div className="p-5 bg-paper-subtle">
                        <h4 className="mq-mono-label text-ink-muted mb-4">Overlap Moments</h4>
                        {(!mentor.overlaps || mentor.overlaps.length === 0) ? (
                          <p className="text-sm text-ink-muted">
                            No overlapping availability found.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mentor.overlaps.map((ov, i) => {
                              const bookingKey = `${mentor.id}-${ov.day_of_week}-${ov.overlap_start}`;
                              const isBookingThis = activeBookingId === bookingKey;
                              return (
                                <div key={i} className="flex flex-col bg-surface border border-border rounded-sm p-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold text-ink">{daysMap[ov.day_of_week]}</span>
                                  </div>
                                  
                                  {/* The Signature Overlap Moment Visual */}
                                  <div className="mq-overlap-base h-12 w-full rounded-sm mb-4 relative flex items-center justify-center">
                                    <div className="absolute inset-y-1 left-[20%] right-[20%] mq-overlap-solid rounded-sm flex items-center justify-center shadow-inner">
                                      <span className="mq-mono-label tracking-normal text-[10px]">
                                        {ov.overlap_start.substring(0,5)} - {ov.overlap_end.substring(0,5)}
                                      </span>
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => handleBookCall(mentor, ov, bookingKey)}
                                    disabled={activeBookingId !== null}
                                    className="mq-btn-secondary w-full"
                                  >
                                    {isBookingThis ? "Booking..." : "Book call"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {bookingStatus && (
                  <div className={`p-3 text-sm border font-medium ${bookingStatus.includes('Error') ? 'bg-danger-light border-danger/20 text-danger' : 'bg-teal-light border-teal/20 text-teal'}`}>
                    {bookingStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-w-4xl mq-scroll pr-4">
          {loadingBookings ? (
            <div className="text-center text-sm text-ink-muted mt-10">Loading bookings...</div>
          ) : (
            <BookingsList bookings={bookings} role="admin" emptyMessage="No calls have been scheduled yet." />
          )}
        </div>
      )}
    </div>
  );
}
