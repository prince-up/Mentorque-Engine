import { useState, useEffect } from "react";
import AvailabilityDashboard from "../components/AvailabilityDashboard";
import { get } from "../api/client";
import BookingsList from "../components/BookingsList";

export default function MentorAvailability() {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl mq-heading font-semibold text-ink">Mentor Dashboard</h1>
        <p className="text-sm text-ink-muted mt-1">Define the times you are available to take mentoring calls.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-xl mq-heading font-semibold text-ink mb-4">Your Availability</h2>
          <AvailabilityDashboard role="mentor" />
        </div>
        <div>
          <h2 className="text-xl mq-heading font-semibold text-ink mb-4">Assigned Students</h2>
          {loadingBookings ? (
            <div className="text-sm text-ink-muted">Loading assignments...</div>
          ) : (
            <BookingsList 
              bookings={bookings} 
              role="mentor" 
              emptyMessage="No students assigned yet." 
            />
          )}
        </div>
      </div>
    </div>
  );
}
