// controllers/bookingController.js
const { v4: uuidv4 } = require("uuid");
const escape = require("escape-html");
const pool = require("../config/db");
const AppError = require("../middlewares/AppError");
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
  const { user_id, event_id, quantity = 1 } = req.body;
  const requestedTickets = Number(quantity);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock event row
    const [[event]] = await conn.query(
      `SELECT id, title, remaining_tickets
       FROM events
       WHERE id = ?
       FOR UPDATE`,
      [Number(event_id)]
    );
    if (!event) throw AppError.notFound("Event not found");

    // Check user exists
    const [[user]] = await conn.query(
      `SELECT id FROM users WHERE id = ?`,
      [Number(user_id)]
    );
    if (!user) throw AppError.notFound("User not found");

    // Check if user already has a booking for this event
    const [[existingBooking]] = await conn.query(
      `SELECT id, quantity FROM bookings WHERE user_id = ? AND event_id = ?`,
      [Number(user_id), Number(event_id)]
    );

    let finalQuantity = requestedTickets;
    let additionalTickets = requestedTickets;

    if (existingBooking) {
      // User already has a booking – we will increase quantity
      const currentQuantity = existingBooking.quantity;
      finalQuantity = currentQuantity + requestedTickets;
      additionalTickets = requestedTickets; // we only need to decrement the additional amount
    }

    // Check if enough tickets remain
    if (event.remaining_tickets < additionalTickets) {
      throw AppError.conflict(
        `Only ${event.remaining_tickets} tickets available. You requested ${additionalTickets} additional tickets.`
      );
    }

    // Decrement remaining_tickets by additionalTickets
    await conn.query(
      `UPDATE events
       SET remaining_tickets = remaining_tickets - ?
       WHERE id = ?`,
      [additionalTickets, Number(event_id)]
    );

    let uniqueCode;
    let bookingId;

    if (existingBooking) {
      // Update existing booking: increase quantity
      await conn.query(
        `UPDATE bookings
         SET quantity = ?
         WHERE id = ?`,
        [finalQuantity, existingBooking.id]
      );
      bookingId = existingBooking.id;
      // Keep the existing unique_code (you may also generate a new one, but keeping is fine)
      const [[booking]] = await conn.query(
        `SELECT unique_code FROM bookings WHERE id = ?`,
        [existingBooking.id]
      );
      uniqueCode = booking.unique_code;
    } else {
      // New booking: generate UUID and insert
      uniqueCode = uuidv4();
      const [result] = await conn.query(
        `INSERT INTO bookings (user_id, event_id, quantity, booking_date, unique_code)
         VALUES (?, ?, ?, NOW(), ?)`,
        [Number(user_id), Number(event_id), requestedTickets, uniqueCode]
      );
      bookingId = result.insertId;
    }

    await conn.commit();

    // Prepare response message
    let message;
    if (existingBooking) {
      message = `Booking updated: total quantity is now ${finalQuantity} tickets (added ${requestedTickets} more)`;
    } else {
      message = `Booking confirmed for ${requestedTickets} ticket(s)`;
    }

    res.status(201).json({
      success: true,
      message: message,
      data: {
        booking_id:   bookingId,
        user_id:      Number(user_id),
        event_id:     Number(event_id),
        event_title:  escape(event.title),
        quantity:     finalQuantity,
        unique_code:  uniqueCode,
        booking_date: new Date(),
      },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { createBooking };