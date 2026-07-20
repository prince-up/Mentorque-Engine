import { useState, useEffect } from "react";
import { get, post } from "../api/client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

export default function AvailabilityDashboard({ role }) {
  const [availability, setAvailability] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [role]);

  const fetchAvailability = async () => {
    try {
      const data = await get("/api/availability/weekly");
      const mapped = {};
      data.forEach(slot => {
        const d = slot.day_of_week;
        const t = slot.start_time.substring(0, 5);
        if (!mapped[d]) mapped[d] = new Set();
        mapped[d].add(t);
      });
      setAvailability(mapped);
    } catch (err) {
      setError("Failed to load availability.");
    }
  };

  const toggleSlot = (dayIdx, timeStr) => {
    if (!isEditing) return;
    setAvailability(prev => {
      const copy = { ...prev };
      if (!copy[dayIdx]) copy[dayIdx] = new Set();
      
      const newSet = new Set(copy[dayIdx]);
      if (newSet.has(timeStr)) {
        newSet.delete(timeStr);
      } else {
        newSet.add(timeStr);
      }
      copy[dayIdx] = newSet;
      return copy;
    });
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    setSaveStatus("");
    try {
      const payload = { slots: [] };
      Object.keys(availability).forEach(dayIdx => {
        availability[dayIdx].forEach(t => {
          const hour = parseInt(t.split(':')[0], 10);
          const endHour = (hour + 1).toString().padStart(2, "0") + ":00";
          payload.slots.push({
            day_of_week: parseInt(dayIdx, 10),
            start_time: t,
            end_time: endHour
          });
        });
      });
      await post("/api/availability/batch", payload);
      setSaveStatus("Availability saved successfully.");
      setIsEditing(false);
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      setSaveStatus("Could not save availability. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mq-card overflow-hidden">
      <div className="border-b border-border p-6 flex items-center justify-between bg-surface">
        <div>
          <h2 className="text-xl mq-heading font-semibold">Weekly Availability</h2>
          <p className="text-sm text-ink-muted mt-1">Set your standard hours for meetings.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className={`text-sm ${saveStatus.includes('Could not') ? 'text-danger' : 'text-teal'}`}>
              {saveStatus}
            </span>
          )}
          {error && <span className="text-sm text-danger">{error}</span>}
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsEditing(false); fetchAvailability(); }}
                className="mq-btn-secondary"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={saveAvailability}
                className="mq-btn-primary min-w-[100px]"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="mq-btn-secondary"
            >
              Edit availability
            </button>
          )}
        </div>
      </div>

      <div className="p-6 bg-paper-subtle overflow-x-auto mq-scroll">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-px mb-2">
            <div className="w-16"></div>
            {DAYS.map(day => (
              <div key={day} className="text-center pb-2">
                <span className="mq-mono-label text-ink-muted">{day}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-border shadow-sm">
            {TIMES.map(time => (
              <div key={time} className="grid grid-cols-8 gap-px">
                <div className="bg-surface flex items-center justify-center p-2">
                  <span className="mq-mono-label text-ink-muted">{time}</span>
                </div>
                {DAYS.map((_, dayIdx) => {
                  const isSelected = availability[dayIdx]?.has(time);
                  return (
                    <div 
                      key={`${dayIdx}-${time}`} 
                      className={`bg-surface p-1 transition-colors duration-150 ${isEditing ? 'hover:bg-paper cursor-pointer' : ''}`}
                      onClick={() => toggleSlot(dayIdx, time)}
                    >
                      <div className={`w-full h-10 rounded-sm transition-all duration-150 flex items-center justify-center ${isSelected ? 'bg-teal shadow-inner border border-teal-hover text-white' : 'bg-paper-subtle border border-border hover:bg-border/30'}`}>
                        {isSelected && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
