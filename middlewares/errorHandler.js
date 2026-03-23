// middleware/errorHandler.js
// ─────────────────────────────────────────────────────────────
// 1. asyncHandler — eliminates try/catch boilerplate in every route
// 2. errorHandler — single place that formats ALL errors into JSON
// ─────────────────────────────────────────────────────────────
const AppError = require("./AppError");

// ── asyncHandler ─────────────────────────────────────────────
// Wraps any async route fn so unhandled promise rejections are
// automatically forwarded to Express's next(err) error pipeline.
//
// Without this:
//   router.get("/", async (req, res, next) => {
//     try { ... } catch (err) { next(err); }   // repeated everywhere
//   });
//
// With this:
//   router.get("/", asyncHandler(async (req, res) => { ... }));
//
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Global error handler ──────────────────────────────────────
// Must have exactly 4 parameters for Express to treat it as an
// error-handling middleware (even if `next` is unused).
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // ── Known app errors (thrown intentionally) ──
  if (err.isAppError) {
    return res.status(err.status).json({
      success: false,
      status:  err.status,
      error:   err.message,
      // If validation collected multiple errors, expose the array too
      ...(err.errors && { errors: err.errors }),
    });
  }

  // ── MySQL / DB errors ────────────────────────────────────────
  if (err.code) {
    // Duplicate entry (UNIQUE constraint violated)
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        status:  409,
        error:   "A record with this value already exists (duplicate entry)",
      });
    }
    // Foreign key constraint failed — referenced row doesn't exist
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({
        success: false,
        status:  404,
        error:   "Referenced resource does not exist",
      });
    }
    // Data too long
    if (err.code === "ER_DATA_TOO_LONG") {
      return res.status(400).json({
        success: false,
        status:  400,
        error:   "One or more field values exceed the maximum allowed length",
      });
    }
  }

  // ── JSON parse errors (malformed request body) ───────────────
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      status:  400,
      error:   "Invalid JSON in request body",
    });
  }

  // ── Unexpected errors — log full detail, hide from client ────
  console.error("Unhandled error:", {
    method:  req.method,
    path:    req.path,
    message: err.message,
    stack:   err.stack,
  });

  return res.status(500).json({
    success: false,
    status:  500,
    error:   "Internal server error",
  });
};

module.exports = { asyncHandler, errorHandler };