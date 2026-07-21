import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.js";
import { availabilityRoutes } from "./routes/availability.js";
import { callRequestsRoutes } from "./routes/callRequests.js";
import { bookingsRoutes } from "./routes/bookings.js";
import { adminMentorsRoutes } from "./routes/adminMentors.js";
import { profileRoutes } from "./routes/profile.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "https://mentorque-engine.vercel.app"
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/call-requests", callRequestsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/admin/mentors", adminMentorsRoutes);
app.use("/api/profile", profileRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});