import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login({ role }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setError("");
      await login(role, email, password);
      if (role === "admin") navigate("/admin");
      else if (role === "mentor") navigate("/mentor");
      else navigate("/availability");
    } catch (err) {
      setError(err.message || "Failed to log in");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[360px]">
        
        <Link to="/welcome" className="inline-flex items-center text-xs text-ink-muted hover:text-ink transition-colors mb-8 font-medium">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </Link>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mq-heading tracking-tight capitalize">
            Sign in
          </h2>
          <p className="text-sm text-ink-muted mt-1">Continue as {role} to manage your schedule</p>
        </div>
        
        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger px-3 py-2 rounded-sm mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mq-input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mq-input"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mq-btn-primary w-full mt-2"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
