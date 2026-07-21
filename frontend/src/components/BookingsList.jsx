import React from 'react';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5); // "HH:MM:SS" -> "HH:MM"
};

const formatCallType = (type) => {
  if (!type) return '';
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BookingsList({ bookings, role, emptyMessage }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-ink-muted text-sm border border-dashed border-border rounded-sm">
        {emptyMessage || "No bookings found."}
      </div>
    );
  }

  const showStudent = role === 'admin' || role === 'mentor';
  const showMentor = role === 'admin' || role === 'user';

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-surface border border-border shadow-sm rounded-sm p-5 hover:border-teal/30 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col gap-1">
              <span className="mq-mono-label text-teal bg-teal-light px-2 py-0.5 rounded-sm self-start mb-1">
                {formatCallType(booking.call_type)}
              </span>
              
              <div className="text-sm">
                {showStudent && (
                  <div className="mb-1">
                    <span className="text-ink-muted mr-2">Student:</span>
                    <span className="font-semibold text-ink">{booking.user_name}</span>
                  </div>
                )}
                {showMentor && (
                  <div>
                    <span className="text-ink-muted mr-2">Mentor:</span>
                    <span className="font-semibold text-ink">{booking.mentor_name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-ink-muted mb-1">Scheduled For</div>
              <div className="font-semibold text-ink">
                {daysMap[booking.scheduled_day]}
              </div>
              <div className="text-sm text-ink-muted mt-0.5 font-mono">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </div>
            </div>
          </div>
          
          {booking.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">"{booking.description}"</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
