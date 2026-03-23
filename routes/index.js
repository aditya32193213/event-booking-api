// routes/index.js
// ─────────────────────────────────────────────────────────────
// Central route registry.
// Import this single file in app.js instead of importing each
// route file individually. To add a new resource, just add one
// line here — app.js never needs to change.
// ─────────────────────────────────────────────────────────────
const express  = require("express");
const router   = express.Router();

const eventsRouter   = require("./events");
const bookingsRouter = require("./bookings");
const usersRouter    = require("./users");

// ── Mount routes ─────────────────────────────────────────────
router.use("/events",   eventsRouter);
router.use("/bookings", bookingsRouter);
router.use("/users",    usersRouter);

module.exports = router;