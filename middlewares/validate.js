// middleware/validate.js
const AppError = require("./AppError");

// ── Type helpers ─────────────────────────────────────────────
const isPositiveInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;
const isNonEmpty    = (v) => typeof v === "string" && v.trim().length > 0;
const isValidDate   = (v) => !isNaN(Date.parse(v));
const isFutureDate  = (v) => !isNaN(Date.parse(v)) && new Date(v) > new Date();

// ── assertAll — collect ALL broken rules, throw once ─────────
function assertAll(rules) {
  const errors = rules
    .filter(([condition]) => !condition)
    .map(([, message]) => message);

  if (errors.length > 0) {
    const err  = AppError.badRequest(errors.join(" | "));
    err.errors = errors;
    throw err;
  }
}

// ── assertChain — stop at first failure (for dependent rules) ─
function assertChain(rules) {
  for (const [condition, message] of rules) {
    if (!condition) {
      const err  = AppError.badRequest(message);
      err.errors = [message];
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Route-specific validators
// ─────────────────────────────────────────────────────────────

function validateCreateEvent(body) {
  const { title, date, total_capacity, description } = body;

  // Phase 1 — presence of all required fields (report all at once)
  assertAll([
    [isNonEmpty(title),                    "title is required and must be a non-empty string"],
    [date !== undefined && date !== null,  "date is required"],  
    [total_capacity !== undefined,         "total_capacity is required"],
    [
      description === undefined || description === null || typeof description === "string",
      "description must be a string if provided",
    ],
  ]);

  // Phase 2 — date format then future check (short-circuit: stops at first failure)
  assertChain([
    [isValidDate(date),  "date must be a valid ISO date-time string (e.g. 2025-12-01T18:00:00)"],
    [isFutureDate(date), "date must be in the future"],
  ]);

  // Phase 3 — capacity type (short-circuit)
  assertChain([
    [isPositiveInt(total_capacity), "total_capacity must be a positive integer"],
  ]);
}

function validateCreateBooking(body) {
  const { user_id, event_id } = body;

  // Phase 1 — presence
  assertAll([
    [user_id  !== undefined, "user_id is required"],
    [event_id !== undefined, "event_id is required"],
  ]);

  // Phase 2 — types
  assertAll([
    [isPositiveInt(user_id),  "user_id must be a positive integer"],
    [isPositiveInt(event_id), "event_id must be a positive integer"],
  ]);
}

function validateAttendance(body) {
  const { booking_code } = body;
  assertAll([
    [isNonEmpty(booking_code), "booking_code is required and must be a non-empty string"],
  ]);
}

function validateUserId(param) {
  assertChain([
    [isPositiveInt(param), "User id must be a positive integer"],
  ]);
}

function validateEventId(param) {
  assertChain([
    [isPositiveInt(param), "Event id must be a positive integer"],
  ]);
}

module.exports = {
  validateCreateEvent,
  validateCreateBooking,
  validateAttendance,
  validateUserId,
  validateEventId,
};