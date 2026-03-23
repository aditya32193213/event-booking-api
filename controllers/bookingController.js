// controllers/bookingController.js
const { v4: uuidv4 } = require("uuid");
const pool            = require("../config/db");  
const AppError        = require("../middlewares/AppError");
const { validateCreateBooking } = require("../middlewares/validate");

// ─────────────────────────────────────────────────────────────
// POST /bookings
// Body: { user_id, event_id }
//
// Transaction steps:
//   1. Lock the event row (SELECT ... FOR UPDATE)
//   2. Check remaining_tickets > 0
//   3. Verify user exists
//   4. Check user hasn't already booked this event
//   5. Decrement remaining_tickets atomically
//   6. Insert booking with UUID unique_code
//   7. Commit
// ─────────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
  validateCreateBooking(req.body);

  const { user_id, event_id } = req.body;

  // Dedicated connection — transactions must stay on one connection
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Step 1 — row-level lock prevents concurrent overselling
    const [[event]] = await conn.query(
      `SELECT id, title, remaining_tickets
       FROM events
       WHERE id = ?
       FOR UPDATE`,
      [Number(event_id)]
    );
    if (!event) throw AppError.notFound("Event not found");

    // Step 2 — availability check
    if (event.remaining_tickets <= 0)
      throw AppError.conflict("No tickets remaining for this event");

    // Step 3 — verify user exists
    const [[user]] = await conn.query(
      `SELECT id FROM users WHERE id = ?`,
      [Number(user_id)]
    );
    if (!user) throw AppError.notFound("User not found");

    // Step 4 — prevent duplicate booking
    const [[dup]] = await conn.query(
      `SELECT id FROM bookings WHERE user_id = ? AND event_id = ?`,
      [Number(user_id), Number(event_id)]
    );
    if (dup) throw AppError.conflict("User has already booked this event");

    // Step 5 — decrement atomically
    await conn.query(
      `UPDATE events
       SET remaining_tickets = remaining_tickets - 1
       WHERE id = ?`,
      [Number(event_id)]
    );

    // Step 6 — generate UUID and insert booking
    const uniqueCode = uuidv4();
    const [result]   = await conn.query(
      `INSERT INTO bookings (user_id, event_id, booking_date, unique_code)
       VALUES (?, ?, NOW(), ?)`,
      [Number(user_id), Number(event_id), uniqueCode]
    );

    // Step 7 — commit
    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Booking confirmed",
      data: {
        booking_id:   result.insertId,
        user_id:      Number(user_id),
        event_id:     Number(event_id),
        event_title:  event.title,
        unique_code:  uniqueCode,
        booking_date: new Date(),
      },
    });
  } catch (err) {
    await conn.rollback();   // roll back on ANY error
    throw err;               // re-throw → asyncHandler → errorHandler
  } finally {
    conn.release();          // always return connection to pool
  }
};

module.exports = { createBooking };