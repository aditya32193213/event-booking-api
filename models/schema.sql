-- ============================================================
--  Event Booking System — Database Schema
-- ============================================================

-- Drop tables in reverse dependency order (safe re-runs)
DROP TABLE IF EXISTS event_attendance;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
CREATE TABLE users (
    id    INT           NOT NULL AUTO_INCREMENT,
    name  VARCHAR(100)  NOT NULL,
    email VARCHAR(150)  NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
);

-- ------------------------------------------------------------
-- 2. EVENTS
-- ------------------------------------------------------------
CREATE TABLE events (
    id                INT           NOT NULL AUTO_INCREMENT,
    title             VARCHAR(200)  NOT NULL,
    description       TEXT,
    date              DATETIME      NOT NULL,
    total_capacity    INT           NOT NULL CHECK (total_capacity > 0),
    remaining_tickets INT           NOT NULL CHECK (remaining_tickets >= 0),

    PRIMARY KEY (id),
    -- remaining_tickets can never exceed the total seats
    CONSTRAINT chk_remaining CHECK (remaining_tickets <= total_capacity)
);

-- ------------------------------------------------------------
-- 3. BOOKINGS
-- ------------------------------------------------------------
CREATE TABLE bookings (
    id           INT          NOT NULL AUTO_INCREMENT,
    user_id      INT          NOT NULL,
    event_id     INT          NOT NULL,
    quantity     INT          NOT NULL DEFAULT 1 CHECK (quantity > 0),
    booking_date DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unique_code  VARCHAR(64)  NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_bookings_unique_code (unique_code),
    UNIQUE KEY uq_bookings_user_event  (user_id, event_id),

    CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_event
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. EVENT ATTENDANCE
-- ------------------------------------------------------------
CREATE TABLE event_attendance (
    id           INT          NOT NULL AUTO_INCREMENT,
    user_id      INT          NOT NULL,
    entry_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    booking_code VARCHAR(64)  NOT NULL,   -- matches bookings.unique_code

    PRIMARY KEY (id),
    UNIQUE KEY uq_attendance_booking_code (booking_code),      -- one check-in per booking

    CONSTRAINT fk_attendance_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_booking_code
        FOREIGN KEY (booking_code) REFERENCES bookings (unique_code) ON DELETE CASCADE
);