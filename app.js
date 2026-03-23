// app.js
// ─────────────────────────────────────────────────────────────
// Express application setup.
// This file creates and configures the app but does NOT start
// the server — that's server.js's job.
// ─────────────────────────────────────────────────────────────
require("dotenv").config();

const express    = require("express");
const swaggerUi  = require("swagger-ui-express");
const YAML       = require("yamljs");
const path       = require("path");

const router              = require("./routes/index");
const { errorHandler }    = require("./middlewares/errorHandler");

const app = express();

// ── Body parser ───────────────────────────────────────────────
app.use(express.json());

// ── Swagger UI ────────────────────────────────────────────────
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "Event Booking API Docs",
    swaggerOptions: {
      docExpansion:         "list",  // endpoints collapsed by default
      defaultModelsExpandDepth: 1,   // show schemas one level deep
      filter:               true,    // enable search bar
      tryItOutEnabled:      true,    // "Try it out" open by default
    },
  })
);

// ── Mount all routes via single index router ──────────────────
app.use(router);

// ── 404 catch-all (must come after all routes) ────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, status: 404, error: "Route not found" });
});

// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler);

module.exports = app;