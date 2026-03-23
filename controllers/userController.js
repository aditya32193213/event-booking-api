// controllers/userController.js
const pool     = require("../config/db");          
const AppError = require("../middlewares/AppError");
const { validateUserId } = require("../middlewares/validate");

// ─────────────────────────────────────────────────────────────
// GET /users/:id/bookings
// Returns all bookings for a user joined with full event details.
// Sorted by booking_date DESC (most recent first).
// ─────────────────────────────────────────────────────────────
const getUserBookings = async (req, res) => {
  validateUserId(req.params.id);

  const userId = Number(req.params.id);

  const [[user]] = await pool.query(
    `SELECT id, name, email FROM users WHERE id = ?`,
    [userId]
  );
  if (!user) throw AppError.notFound("User not found");

  const [bookings] = await pool.query(
    `SELECT
       b.id            AS booking_id,
       b.booking_date,
       b.unique_code,
       e.id            AS event_id,
       e.title         AS event_title,
       e.description   AS event_description,
       e.date          AS event_date,
       e.total_capacity,
       e.remaining_tickets
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.user_id = ?
     ORDER BY b.booking_date DESC`,
    [userId]
  );

  res.status(200).json({
    success: true,
    user:    { id: user.id, name: user.name, email: user.email },
    count:   bookings.length,
    data:    bookings,
  });
};

module.exports = { getUserBookings };