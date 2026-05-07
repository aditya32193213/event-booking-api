// middleware/validate.js
const AppError = require("./AppError");

// ── Constants ─────────────────────────────────────────────
const MAX_TITLE_LENGTH = 200;
const MAX_DESC_LENGTH  = 2000;
const MAX_CAPACITY     = 100000;
const MAX_FUTURE_YEARS = 2;

// ── Helpers ───────────────────────────────────────────────
const isPositiveInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;
const isNonEmpty     = (v) => typeof v === "string" && v.trim().length > 0;
const isValidDate    = (v) => !isNaN(Date.parse(v));
const isFutureDate   = (v) => isValidDate(v) && new Date(v) > new Date();
const isReasonableFutureDate = (v) => {
  if (!isValidDate(v)) return false;
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + MAX_FUTURE_YEARS);
  return new Date(v) <= maxDate;
};
const hasNoHtmlTags = (str) => {
  if (typeof str !== "string") return false;
  // Reject if contains <...> or &...; or javascript: scheme
  return !/<[^>]*>|&[#\w]+;|javascript:/i.test(str);
};
const isUuidV4 = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// ── assertAll / assertChain (same as before) ──────────────
function assertAll(rules) {
  const errors = rules.filter(([condition]) => !condition).map(([, message]) => message);
  if (errors.length > 0) {
    const err = AppError.badRequest(errors.join(" | "));
    err.errors = errors;
    throw err;
  }
}

function assertChain(rules) {
  for (const [condition, message] of rules) {
    if (!condition) {
      const err = AppError.badRequest(message);
      err.errors = [message];
      throw err;
    }
  }
}

// ───────────────────────────────────────────────────────────
// validateCreateEvent – STRICT VERSION
// ───────────────────────────────────────────────────────────
function validateCreateEvent(body) {
  const { title, date, total_capacity, description } = body;

  // 1. Required presence
  assertAll([
    [isNonEmpty(title),                    "title is required and must be a non-empty string"],
    [date !== undefined && date !== null,  "date is required"],
    [total_capacity !== undefined,         "total_capacity is required"],
    [description === undefined || description === null || typeof description === "string",
     "description must be a string if provided"],
  ]);

  // 2. Length & XSS prevention (title)
  assertChain([
    [title.trim().length <= MAX_TITLE_LENGTH,
     `title must be at most ${MAX_TITLE_LENGTH} characters`],
    [hasNoHtmlTags(title),
     "title contains HTML, JavaScript, or invalid entities (XSS prevention)"],
  ]);

  // 3. Date validation (valid, future, not too far)
  assertChain([
    [isValidDate(date), "date must be a valid ISO date-time string"],
    [isFutureDate(date), "date must be in the future"],
    [isReasonableFutureDate(date),
     `date cannot be more than ${MAX_FUTURE_YEARS} years from now`],
  ]);

  // 4. Capacity validation (positive + upper bound)
  assertChain([
    [isPositiveInt(total_capacity), "total_capacity must be a positive integer"],
    [Number(total_capacity) <= MAX_CAPACITY,
     `total_capacity cannot exceed ${MAX_CAPACITY}`],
  ]);

  // 5. Description validation (if provided)
  if (description !== undefined && description !== null) {
    const desc = description.trim();
    assertChain([
      [desc.length <= MAX_DESC_LENGTH,
       `description must be at most ${MAX_DESC_LENGTH} characters`],
      [hasNoHtmlTags(desc),
       "description contains HTML/JavaScript (XSS prevention)"],
    ]);
  }
}

// ───────────────────────────────────────────────────────────
// validateCreateBooking – with quantity (strict)
// ───────────────────────────────────────────────────────────
function validateCreateBooking(body) {
  const { user_id, event_id, quantity } = body;

  assertAll([
    [user_id !== undefined, "user_id is required"],
    [event_id !== undefined, "event_id is required"],
  ]);

  assertAll([
    [isPositiveInt(user_id), "user_id must be a positive integer"],
    [isPositiveInt(event_id), "event_id must be a positive integer"],
  ]);

  if (quantity !== undefined) {
    assertChain([
      [isPositiveInt(quantity), "quantity must be a positive integer"],
      [Number(quantity) <= 100, "quantity cannot exceed 100 per booking"], // sensible limit
    ]);
  }
}

// ───────────────────────────────────────────────────────────
// validateAttendance – strict UUID check
// ───────────────────────────────────────────────────────────
function validateAttendance(body) {
  const { booking_code } = body;

  assertAll([
    [isNonEmpty(booking_code), "booking_code is required and must be a non-empty string"],
  ]);

  // Crucial: ensure it's a valid UUID v4 (since you generate with uuidv4())
  assertChain([
    [isUuidV4(booking_code.trim()), "booking_code must be a valid UUID v4"],
  ]);
}

// ───────────────────────────────────────────────────────────
// validateUserId / validateEventId (can stay same, but add upper bound)
// ───────────────────────────────────────────────────────────
function validateUserId(param) {
  assertChain([
    [isPositiveInt(param), "User id must be a positive integer"],
    [Number(param) <= 999999999, "User id exceeds maximum allowed"],
  ]);
}

function validateEventId(param) {
  assertChain([
    [isPositiveInt(param), "Event id must be a positive integer"],
    [Number(param) <= 999999999, "Event id exceeds maximum allowed"],
  ]);
}

module.exports = {
  validateCreateEvent,
  validateCreateBooking,
  validateAttendance,
  validateUserId,
  validateEventId,
};