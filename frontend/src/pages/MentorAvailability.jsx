import AvailabilityDashboard from "../components/AvailabilityDashboard";

export default function MentorAvailability() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl mq-heading font-semibold text-ink">Mentor Dashboard</h1>
        <p className="text-sm text-ink-muted mt-1">Define the times you are available to take mentoring calls.</p>
      </div>
      
      <div className="w-full lg:w-2/3">
        <AvailabilityDashboard role="mentor" />
      </div>
    </div>
  );
}
