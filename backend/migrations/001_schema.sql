CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE user_role AS ENUM ('user', 'mentor', 'admin');
CREATE TYPE call_type AS ENUM ('resume_revamp', 'job_market_guidance', 'mock_interview');
CREATE TYPE booking_status AS ENUM ('pending', 'matched', 'booked');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tags JSONB DEFAULT '[]',
    description TEXT
);

CREATE TABLE mentor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tags JSONB DEFAULT '[]',
    description TEXT
);

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_role user_role NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE(owner_id, day_of_week, start_time)
);

CREATE TABLE call_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_type call_type NOT NULL,
    description TEXT,
    status booking_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_request_id UUID NOT NULL REFERENCES call_requests(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    scheduled_day INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE embeddings (
    owner_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    owner_role user_role NOT NULL,
    vector vector(384),
    source_text TEXT
);
