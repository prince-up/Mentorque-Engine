import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl mq-heading font-semibold mb-2">Mentorque</h1>
          <p className="text-sm text-ink-muted">Select your workspace role to continue</p>
        </div>
        
        <div className="space-y-3">
          <Link
            to="/login/user"
            className="flex items-center justify-between w-full p-4 mq-card hover:bg-paper-subtle hover:border-border-dark transition-colors duration-150 group"
          >
            <span className="text-sm font-medium text-ink">Continue as User</span>
            <svg className="w-4 h-4 text-border-dark group-hover:text-ink transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
          
          <Link
            to="/login/mentor"
            className="flex items-center justify-between w-full p-4 mq-card hover:bg-paper-subtle hover:border-border-dark transition-colors duration-150 group"
          >
            <span className="text-sm font-medium text-ink">Continue as Mentor</span>
            <svg className="w-4 h-4 text-border-dark group-hover:text-ink transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
          
          <Link
            to="/login/admin"
            className="flex items-center justify-between w-full p-4 mq-card hover:bg-paper-subtle hover:border-border-dark transition-colors duration-150 group"
          >
            <span className="text-sm font-medium text-ink">Continue as Admin</span>
            <svg className="w-4 h-4 text-border-dark group-hover:text-ink transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
