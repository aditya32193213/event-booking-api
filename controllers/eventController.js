// controllers/eventController.js
const pool     = require("../config/db");          
const AppError = require("../middlewares/AppError");
const {
  validateCreateEvent,
  validateAttendance,
  validateEventId,
} = require("../middlewares/validate");

// ─────────────────────────────────────────────────────────────
// GET /events — returns all upcoming events, sorted by date ASC
// ─────────────────────────────────────────────────────────────
const getAllEvents = async (req, res) => {
  const [events] = await pool.query(
    `SELECT
       id,
       title,
       description,
       date,
       total_capacity,
       remaining_tickets
     FROM events
     WHERE date >= NOW()
     ORDER BY date ASC`
  );

  res.status(200).json({
    success: true,
    count:   events.length,
    data:    events,
  });
};

// ─────────────────────────────────────────────────────────────
// POST /events — validate body, insert new event
// remaining_tickets is auto-set to total_capacity on creation
// ─────────────────────────────────────────────────────────────
const createEvent = async (req, res) => {
  validateCreateEvent(req.body);

  const { title, description, date, total_capacity } = req.body;
  const capacity = Number(total_capacity);

  const [result] = await pool.query(
    `INSERT INTO events (title, description, date, total_capacity, remaining_tickets)
     VALUES (?, ?, ?, ?, ?)`,
    [title.trim(), description?.trim() || null, new Date(date), capacity, capacity]
  );

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: {
      id:                result.insertId,
      title:             title.trim(),
      description:       description?.trim() || null,
      date:              new Date(date),
      total_capacity:    capacity,
      remaining_tickets: capacity,
    },
  });
};

// ─────────────────────────────────────────────────────────────
// POST /events/:id/attendance
// Validates booking_code belongs to this event, records check-in,
// returns total tickets sold (useful for live dashboards)
// ─────────────────────────────────────────────────────────────
const recordAttendance = async (req, res) => {
  validateEventId(req.params.id);
  validateAttendance(req.body);

  const eventId = Number(req.params.id);
  const code    = req.body.booking_code.trim();

  // 1. Verify event exists
  const [[event]] = await pool.query(
    `SELECT id, title FROM events WHERE id = ?`,
    [eventId]
  );
  if (!event) throw AppError.notFound("Event not found");

  // 2. Verify booking_code belongs to this specific event
  const [[booking]] = await pool.query(
    `SELECT b.id, b.user_id, b.unique_code
     FROM bookings b
     WHERE b.unique_code = ? AND b.event_id = ?`,
    [code, eventId]
  );
  if (!booking) throw AppError.notFound("Invalid booking code for this event");

  // 3. Prevent duplicate check-in (DB UNIQUE constraint is the final guard)
  const [[existing]] = await pool.query(
    `SELECT id FROM event_attendance WHERE booking_code = ?`,
    [booking.unique_code]
  );
  if (existing) throw AppError.conflict("This ticket has already been scanned");

  // 4. Record attendance
  await pool.query(
    `INSERT INTO event_attendance (user_id, entry_time, booking_code)
     VALUES (?, NOW(), ?)`,
    [booking.user_id, booking.unique_code]
  );

  // 5. Count total tickets sold for this event
  const [[{ total_bookings }]] = await pool.query(
    `SELECT COUNT(*) AS total_bookings FROM bookings WHERE event_id = ?`,
    [eventId]
  );

  res.status(200).json({
    success: true,
    message: "Attendance recorded successfully",
    data: {
      event_id:       eventId,
      event_title:    event.title,
      booking_code:   booking.unique_code,
      total_bookings: Number(total_bookings),
    },
  });
};

module.exports = { getAllEvents, createEvent, recordAttendance };