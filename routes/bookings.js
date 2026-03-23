// routes/bookings.js
// ─────────────────────────────────────────────────────────────
// Pure router — no business logic here.
// Handler lives in controllers/bookingController.js
// ─────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { asyncHandler }  = require("../middlewares/errorHandler");
const { createBooking } = require("../controllers/bookingController");

router.post("/", asyncHandler(createBooking));

module.exports = router;