// server.js
require("dotenv").config();

const express      = require("express");
const swaggerUi    = require("swagger-ui-express");
const YAML         = require("yamljs");
const path         = require("path");

const app = express();

// ── Swagger docs ────────────────────────────────────────────
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "Event Booking API Docs",
    swaggerOptions: {
      docExpansion:     "list",    // show endpoint list collapsed by default
      defaultModelsExpandDepth: 1, // show schemas one level deep
      filter:           true,      // enable the search bar
      tryItOutEnabled:  true,      // "Try it out" open by default
    },
  })
);

// ── Routes ────────────────────────────────────────────────────
const eventsRouter   = require("./routes/events");
const bookingsRouter = require("./routes/bookings");
const usersRouter    = require("./routes/users");
const { errorHandler } = require("./middlewares/errorHandler");

app.use(express.json());

app.use("/events",   eventsRouter);
app.use("/bookings", bookingsRouter);
app.use("/users",    usersRouter);

// ── 404 catch-all ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, status: 404, error: "Route not found" });
});

// ── Global error handler — must be last ──────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server  → http://localhost:${PORT}`);
  console.log(`API Docs → http://localhost:${PORT}/api-docs`);
});