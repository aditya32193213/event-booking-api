// routes/users.js
// ─────────────────────────────────────────────────────────────
// Pure router — no business logic here.
// Handler lives in controllers/userController.js
// ─────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { asyncHandler }    = require("../middlewares/errorHandler");
const { getUserBookings } = require("../controllers/userController");

router.get("/:id/bookings", asyncHandler(getUserBookings));

module.exports = router;