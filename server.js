// server.js
// ─────────────────────────────────────────────────────────────
// Entry point — starts the HTTP server.
// Application setup lives in app.js.
// Keeping these separate makes it easy to:
//   • import app in tests without binding a port
//   • swap the transport layer (HTTP → HTTPS) in one place
// ─────────────────────────────────────────────────────────────
const app  = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server   → http://localhost:${PORT}`);
  console.log(`API Docs → http://localhost:${PORT}/api-docs`);
});