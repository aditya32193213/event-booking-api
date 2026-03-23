// routes/events.js
// ─────────────────────────────────────────────────────────────
// Pure router — no business logic here.
// Each handler lives in controllers/eventController.js
// ─────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  getAllEvents,
  createEvent,
  recordAttendance,
} = require("../controllers/eventController");

router.get(  "/",               asyncHandler(getAllEvents));
router.post( "/",               asyncHandler(createEvent));
router.post( "/:id/attendance", asyncHandler(recordAttendance));

module.exports = router;