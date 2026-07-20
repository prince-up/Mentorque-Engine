# Mentorque Platform

This repository contains the refactored frontend and backend for the Mentorque mentoring platform. The platform has been updated to use custom JWT authentication, Role-Based Access Control (RBAC), a PostgreSQL database with vector embeddings (`pgvector`), and a RAG-based mentor recommendation system.

## Key Changes

### 1. Authentication Simplification
- Removed all Google OAuth and Supabase dependencies.
- Implemented a custom JWT-based authentication system.
- Added separate login routes for Users, Mentors, and Admins (`/login/user`, `/login/mentor`, `/login/admin`).

### 2. Database & Schema
- Migrated from Prisma to raw SQL (`pg` module) to maintain readable DDL as the single source of truth.
- Created `migrations/001_schema.sql` which defines the core tables: `users`, `user_profiles`, `mentor_profiles`, `availability`, `call_requests`, `bookings`, and `embeddings`.
- The availability model relies on `day_of_week` to represent recurring weekly free time, similar to Cal.com.

### 3. RAG-Based Mentor Recommendation
- Uses `@xenova/transformers` locally in the backend for generating embeddings without requiring external API keys.
- Mentor profiles (tags + descriptions) are embedded during the seed process.
- When a user submits a call request, their text description is embedded on the fly and compared to mentor profiles using `pgvector` cosine distance.
- Rule-based boosts are layered on top depending on the call type (e.g., boosting 'big_tech' for 'resume_revamp').

### 4. RBAC & Dashboards
- **User Dashboard**: Can manage availability and submit call requests alongside it.
- **Mentor Dashboard**: Can only manage availability.
- **Admin Dashboard**: Views pending call requests, gets AI-generated mentor recommendations, views availability overlaps, and completes bookings.

## Local Setup

### Prerequisites
- Node.js (v18+)
- NeonDB or local PostgreSQL database with `pgvector` enabled.

### Backend Setup
1. `cd backend`
2. `npm install`
3. Set your `DATABASE_URL` in `backend/.env`.
4. Run migrations: `node scripts/migrate.js`
5. Seed database: `node scripts/seed.js`
6. Start dev server: `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Start Vite dev server: `npm run dev`

## Known Limitations & Future Work
- The frontend UI for the Availability Calendar was preserved but might need some minor adjustments if it expects specific date formats instead of just 0-6 day intervals. (It was left mostly intact per backend API matching).
- With more time, the UI for overlapping times could be visualized on a grid for the Admin. Currently, it displays the overlapping text intervals.
- The `seed.js` script statically seeds 10 users and 5 mentors. Adding a UI for users to sign up and mentors to build profiles would be the next step.
# Mentorque-Engine
