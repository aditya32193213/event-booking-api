// middleware/AppError.js
// ─────────────────────────────────────────────────────────────
// A typed error class so every thrown error carries a status code.
// Usage:  throw AppError.notFound("Event not found")
//         throw AppError.conflict("Ticket already booked")
// ─────────────────────────────────────────────────────────────

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name    = "AppError";
    this.status  = status;
    this.isAppError = true;          // lets the handler distinguish known vs unknown errors
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Named constructors (self-documenting at call sites) ──
  static badRequest(msg)     { return new AppError(msg, 400); }  // invalid input
  static notFound(msg)       { return new AppError(msg, 404); }  // resource missing
  static conflict(msg)       { return new AppError(msg, 409); }  // duplicate / unavailable
  static internal(msg)       { return new AppError(msg || "Internal server error", 500); }
}

module.exports = AppError;