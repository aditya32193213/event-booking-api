<div align="center">

# 🎟️ Event Booking System API

### A production-grade REST API for managing events, ticket bookings & attendance tracking

[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL/MariaDB-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://event-booking-api-production.up.railway.app/api-docs)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> **A full-featured event ticketing backend** — browse events, book tickets with race-condition protection, scan QR codes at the door, and view booking history. Built with clean MVC architecture, layered validation, and interactive Swagger docs.

</div>

---

## 🌐 Live Deployment

| | Link |
|---|---|
| 🚀 **API Base URL** | https://event-booking-api-production.up.railway.app |
| 📖 **Swagger Docs** | https://event-booking-api-production.up.railway.app/api-docs |

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Folder Structure](#-folder-structure)
- [🏗️ System Architecture](#️-system-architecture)
- [🗄️ Database Design](#️-database-design)
- [🚀 Setup Instructions](#-setup-instructions)
- [🌍 Environment Variables](#-environment-variables)
- [📡 API Endpoints](#-api-endpoints)
- [📖 API Documentation (Swagger)](#-api-documentation-swagger)
- [🧪 Testing with Postman](#-testing-with-postman)
- [❌ Error Handling](#-error-handling)
- [✅ Input Validation](#-input-validation)
- [🧠 Architecture & Design Decisions](#-architecture--design-decisions)
- [🐳 Docker Deployment](#-docker-deployment)
- [☁️ Railway Deployment (Live Server)](#️-railway-deployment-live-server)

---

## ✨ Key Features

| # | Feature | Description |
|---|---|---|
| 🎫 | **Event Management** | Create and browse upcoming events with full capacity tracking |
| 🔐 | **Race-Condition-Safe Booking** | MySQL transactions with `SELECT ... FOR UPDATE` row-level locking prevents overselling under concurrent load |
| 🔁 | **Smart Quantity Updates** | Re-booking the same event adds tickets to the existing booking rather than rejecting — no duplicate entry errors |
| 🆔 | **UUID Ticket Codes** | Auto-generated UUID v4 per booking — instantly QR-code ready |
| 🚪 | **Attendance Check-In** | Scan booking codes at the door; duplicate scans blocked at both app & DB level |
| 📋 | **Booking History** | Full per-user booking history with joined event details and per-booking quantity |
| 📚 | **Interactive Swagger UI** | Live, testable API docs served at `/api-docs` |
| 🛡️ | **Two-Phase Validation** | Collect ALL errors in Phase 1, short-circuit dependent rules in Phase 2 |
| 🏗️ | **Clean MVC Architecture** | Routes → Controllers → DB with zero business logic in route files |
| ⚡ | **Async Error Pipeline** | `asyncHandler` wrapper eliminates try/catch boilerplate from every route |
| 🗃️ | **Connection Pooling** | `mysql2` promise pool with configurable limits for production use |
| 🔒 | **XSS Prevention** | Input validated against HTML/JS injection patterns; output escaped via `escape-html` |

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| ⚙️ **Runtime** | Node.js | v22+ | JavaScript server runtime |
| 🚂 **Framework** | Express.js | v5.2.1 | HTTP routing and middleware pipeline |
| 🗄️ **Database** | MySQL / MariaDB | 8.0+ / 11+ | Relational data storage with ACID transactions |
| 🔌 **DB Driver** | mysql2 | v3.20.0 | Promise-based async queries + connection pooling |
| 📖 **API Docs** | swagger-ui-express + yamljs | v5.0.1 | Interactive OpenAPI 3.0 documentation UI |
| 🆔 **Unique IDs** | uuid | v11.0.0 | UUID v4 generation for unique booking codes |
| 🔒 **Output Escaping** | escape-html | v1.0.3 | Sanitizes title/description/name fields in all responses |
| 🔧 **Config** | dotenv | v16.4.5 | Environment variable management |
| 🔄 **Dev Server** | nodemon | v3.1.14 | Auto-restart on file changes during development |

---

## 📁 Folder Structure

```
event-booking-api/
│
├── 📄 app.js                                  # ⚙️  Express setup — body parser, Swagger UI, routes, error handler
├── 📄 server.js                               # 🚀  Entry point — binds HTTP server to port (imports app.js)
├── 📄 swagger.yaml                            # 📖  OpenAPI 3.0 full specification
├── 📄 package.json                            # 📦  Dependencies and npm scripts
├── 📄 .env                                    # 🔐  Local secrets (git-ignored)
├── 📄 .env.example                            # 📋  Environment variable template
├── 📄 .gitignore                              # 🚫  Ignores node_modules, .env
│
├── 📁 config/
│   └── 📄 db.js                               # 🔌  mysql2 connection pool — shared across all controllers
│
├── 📁 controllers/                            # 🧠  ALL business logic lives here
│   ├── 📄 eventController.js                  # getAllEvents, createEvent, recordAttendance
│   ├── 📄 bookingController.js                # createBooking (transaction + FOR UPDATE lock + quantity update)
│   └── 📄 userController.js                   # getUserBookings (JOIN query with quantity)
│
├── 📁 middlewares/                            # 🛡️  Cross-cutting concerns
│   ├── 📄 AppError.js                         # Typed error class: badRequest / notFound / conflict / internal
│   ├── 📄 validate.js                         # assertAll + assertChain two-phase validators
│   └── 📄 errorHandler.js                     # asyncHandler wrapper + global error handler
│
├── 📁 routes/                                 # 🗺️  Pure HTTP wiring — zero logic
│   ├── 📄 index.js                            # Central registry — mounts all sub-routers in one place
│   ├── 📄 events.js                           # GET/POST /events, POST /events/:id/attendance
│   ├── 📄 bookings.js                         # POST /bookings
│   └── 📄 users.js                            # GET /users/:id/bookings
│
├── 📁 models/
│   └── 📄 schema.sql                          # 🗄️  Full DB schema — run once to set up
│
├── 📄 Dockerfile                              # 🐳  Builds Node.js image (node:22-alpine, production deps only)
├── 📄 docker-compose.yml                      # 🐳  Orchestrates API + MySQL 8 containers
├── 📄 .dockerignore                           # 🐳  Excludes node_modules, .env, logs, editor files
│
└── 📄 EventBooking.postman_collection.json    # 🧪  Postman collection with all 5 requests
```

---

## 🏗️ System Architecture

### Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT                                       │
│           (Browser / Postman / Mobile App)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      server.js                                   │
│         Entry Point — binds port, imports app.js                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       app.js                                     │
│              Express Application Configuration                   │
│                                                                  │
│   ┌─────────────────┐    ┌──────────────────────────────────┐   │
│   │   Swagger UI     │    │      express.json()              │   │
│   │   /api-docs      │    │   Body Parser Middleware         │   │
│   └─────────────────┘    └──────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTES LAYER  🗺️                              │
│                  (Pure HTTP wiring)                              │
│                                                                  │
│             routes/index.js  (central registry)                  │
│                       │                                          │
│        ┌──────────────┼──────────────┐                           │
│   events.js      bookings.js      users.js                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │  asyncHandler wraps each controller
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MIDDLEWARES LAYER  🛡️                           │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   validate.js     │  │  AppError.js │  │ errorHandler.js  │  │
│  │  assertAll()      │  │ .badRequest()│  │ asyncHandler()   │  │
│  │  assertChain()    │  │ .notFound()  │  │ errorHandler()   │  │
│  └──────────────────┘  │ .conflict()  │  └──────────────────┘  │
│                         └──────────────┘                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │  Validated request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CONTROLLERS LAYER  🧠                            │
│                  (All Business Logic)                            │
│                                                                  │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│  │  eventController     │  │      bookingController           │  │
│  │  ─────────────────── │  │  ────────────────────────────── │  │
│  │  getAllEvents()       │  │  createBooking()                 │  │
│  │  createEvent()        │  │  • beginTransaction()           │  │
│  │  recordAttendance()   │  │  • SELECT ... FOR UPDATE        │  │
│  └─────────────────────┘  │  • availability check            │  │
│                            │  • new booking OR qty update     │  │
│  ┌─────────────────────┐  │  • decrement tickets atomically  │  │
│  │  userController      │  │  • commit() / rollback()        │  │
│  │  ─────────────────── │  └──────────────────────────────────┘  │
│  │  getUserBookings()    │                                        │
│  └─────────────────────┘                                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │  SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER  🗄️                            │
│                                                                  │
│              config/db.js — mysql2 Connection Pool               │
│              connectionLimit: 10 | queueLimit: 0                 │
│                                                                  │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│    │  users   │  │  events  │  │ bookings │  │   event_    │  │
│    │          │  │          │  │          │  │  attendance │  │
│    │ id (PK)  │  │ id (PK)  │  │ id (PK)  │  │             │  │
│    │ name     │  │ title    │  │ user_id ─┼──│ user_id     │  │
│    │ email    │  │ descr.   │  │ event_id │  │ entry_time  │  │
│    │          │  │ date     │  │ quantity │  │ booking_code│  │
│    │          │  │ capacity │  │ uniq_code│  │             │  │
│    └──────────┘  │ remaining│  └──────────┘  └─────────────┘  │
│                   └──────────┘                                   │
│              MySQL 8+ / MariaDB 11+                              │
└─────────────────────────────────────────────────────────────────┘
```

### MVC Pattern Summary

```
REQUEST  →  Route (wiring only)
                  ↓
            asyncHandler()          ← catches all async errors, forwards to next(err)
                  ↓
            validate.js             ← two-phase input validation
                  ↓
            Controller              ← business logic + DB queries
                  ↓
            config/db.js            ← mysql2 pool (or dedicated conn for transactions)
                  ↓
            MySQL / MariaDB
                  ↓
RESPONSE  ←  JSON (consistent shape)
```

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌────────────────────────┐         ┌────────────────────────────────────┐
│         USERS          │         │              EVENTS                 │
│────────────────────────│         │────────────────────────────────────│
│ 🔑 id          INT PK  │         │ 🔑 id               INT PK         │
│    name        VARCHAR │         │    title             VARCHAR(200)   │
│    email       VARCHAR │◄────┐   │    description       TEXT          │
│    [UNIQUE email]       │    │   │    date              DATETIME       │
└────────────────────────┘    │   │    total_capacity    INT CHECK >0   │
                               │   │    remaining_tickets INT CHECK >=0  │
                               │   │    [CHECK remaining <= total]       │
                               │   └────────────────────────────────────┘
                               │                    │
                               │                    │ 1
                               │                    │
                               │  ┌─────────────────▼──────────────────┐
                               │  │             BOOKINGS                │
                               │  │────────────────────────────────────│
                               └──┤ 🔑 id           INT PK             │
                                  │ 🔗 user_id       INT FK → users     │
                                  │ 🔗 event_id      INT FK → events    │
                                  │    quantity      INT DEFAULT 1      │
                                  │    booking_date  DATETIME DEFAULT   │
                                  │    unique_code   VARCHAR(64) UNIQUE │
                                  │    [UNIQUE user_id + event_id]      │
                                  └────────────────────────────────────┘
                                                    │
                                                    │ unique_code →
                                                    │
                                  ┌─────────────────▼──────────────────┐
                                  │          EVENT_ATTENDANCE           │
                                  │────────────────────────────────────│
                                  │ 🔑 id           INT PK             │
                                  │ 🔗 user_id       INT FK → users     │
                                  │    entry_time    DATETIME DEFAULT   │
                                  │    booking_code  VARCHAR(64) UNIQUE │
                                  │    [FK → bookings.unique_code]      │
                                  └────────────────────────────────────┘
```

### Table Descriptions

| Table | Purpose | Key Constraints |
|---|---|---|
| `users` | User registry | `UNIQUE` on `email` |
| `events` | Event catalog | `CHECK` constraints on capacity; `remaining_tickets <= total_capacity` |
| `bookings` | Ticket bookings | `quantity` column tracks tickets per booking; `UNIQUE` on `unique_code`; composite `UNIQUE(user_id, event_id)` ensures one booking record per user per event |
| `event_attendance` | Check-in log | `UNIQUE` on `booking_code` prevents duplicate scans; FK to `bookings.unique_code` |

### Why `booking_code` links attendance to bookings?
Attendance uses `booking_code` (not `booking_id`) as the FK because real-world check-in scans a **code** (QR/barcode), not a database ID. This mirrors actual event-door workflows and enforces scan uniqueness at the DB level as a final guard.

---

## 🚀 Setup Instructions

### Prerequisites

Before you begin, make sure you have the following installed:

- ✅ [Node.js](https://nodejs.org/) **v18 or higher**
- ✅ [MySQL 8+](https://dev.mysql.com/downloads/) or [MariaDB 11+](https://mariadb.org/download/)
- ✅ [Git](https://git-scm.com/)
- ✅ [Postman](https://www.postman.com/downloads/) *(optional — for API testing)*

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/aditya3219313/event-booking-api.git
cd event-booking-api
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

This installs: `express`, `mysql2`, `uuid`, `dotenv`, `escape-html`, `swagger-ui-express`, `yamljs`, and `nodemon`.

---

### Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your database credentials (see [Environment Variables](#-environment-variables) section below).

---

### Step 4 — Set Up the Database

**Create the database:**
```bash
# Open MySQL/MariaDB CLI
mysql -u root -p

# Inside the CLI:
CREATE DATABASE event_booking;
EXIT;
```

**Import the schema** *(run from your project root)*:

```bash
# On Windows CMD:
mysql -u root -p event_booking < models/schema.sql

# On Windows PowerShell:
cmd /c "mysql -u root -p event_booking < models/schema.sql"

# On macOS/Linux:
mysql -u root -p event_booking < models/schema.sql
```

**Seed test users** *(required for booking endpoints)*:
```sql
USE event_booking;

INSERT INTO users (name, email) VALUES
  ('Priya Sharma', 'priya@example.com'),
  ('Arjun Mehta',  'arjun@example.com');
```

**Verify setup:**
```sql
USE event_booking;
SHOW TABLES;
SELECT * FROM users;
```

Expected output:
```
+-------------------------+
| Tables_in_event_booking |
+-------------------------+
| bookings                |
| event_attendance        |
| events                  |
| users                   |
+-------------------------+
```

---

### Step 5 — Start the Server

```bash
# Development mode (auto-restarts on file save)
npm run dev

# Production mode
npm start
```

**Expected terminal output:**
```
[nodemon] starting `node server.js`
Server   → http://localhost:3000
API Docs → http://localhost:3000/api-docs
```

🎉 **Your API is live!** Open `http://localhost:3000/api-docs` to see the interactive Swagger UI.

---

## 🌍 Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_booking
```

| Variable | Description | Default | Required |
|---|---|---|---|
| `PORT` | Port the Express server listens on | `3000` | ❌ Optional |
| `DB_HOST` | MySQL/MariaDB server host | `localhost` | ✅ Required |
| `DB_USER` | Database username | `root` | ✅ Required |
| `DB_PASSWORD` | Database password | *(empty)* | ✅ Required |
| `DB_NAME` | Name of the database | `event_booking` | ✅ Required |

> ⚠️ **Never commit your `.env` file to Git.** It is already in `.gitignore`.

---

## 📡 API Endpoints

### Base URL
```
https://event-booking-api-production.up.railway.app
```

### Overview

| # | Method | Endpoint | Description | Success Status |
|---|---|---|---|---|
| 1 | `GET` | `/events` | List all upcoming events | `200` |
| 2 | `POST` | `/events` | Create a new event | `201` |
| 3 | `POST` | `/bookings` | Book tickets — creates new booking or adds to existing | `201` |
| 4 | `GET` | `/users/:id/bookings` | Get all bookings for a user | `200` |
| 5 | `POST` | `/events/:id/attendance` | Record check-in via booking code | `200` |

---

### 1️⃣ GET `/events` — List Upcoming Events

Returns all events with `date >= NOW()`, sorted chronologically (ascending).
All titles and descriptions are HTML-escaped in the response to prevent XSS.

**Request:** No body or parameters required.

**Response `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "title": "Node.js Workshop",
      "description": "Hands-on Express + MySQL session",
      "date": "2026-11-15T18:00:00.000Z",
      "total_capacity": 50,
      "remaining_tickets": 48
    }
  ]
}
```

---

### 2️⃣ POST `/events` — Create a New Event

`remaining_tickets` is automatically set equal to `total_capacity` on creation.

**Request Body:**
```json
{
  "title": "Node.js Workshop",
  "description": "Hands-on Express + MySQL session",
  "date": "2026-11-15T18:00:00",
  "total_capacity": 50
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | ✅ | Non-empty, max 200 chars, no HTML/JavaScript tags |
| `date` | string (ISO 8601) | ✅ | Valid date-time, must be in the future, max 2 years from now |
| `total_capacity` | integer | ✅ | Positive integer, max 100,000 |
| `description` | string | ❌ | Optional, max 2,000 chars, no HTML/JavaScript tags |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 1,
    "title": "Node.js Workshop",
    "description": "Hands-on Express + MySQL session",
    "date": "2026-11-15T18:00:00.000Z",
    "total_capacity": 50,
    "remaining_tickets": 50
  }
}
```

---

### 3️⃣ POST `/bookings` — Book Tickets ⭐ Most Complex

Books tickets inside a **MySQL transaction with a row-level lock** to prevent race conditions.

Supports an optional `quantity` field (default `1`, max `100`). If the user has **already booked the same event**, the request **adds tickets** to the existing booking rather than returning a conflict error.

**Request Body:**
```json
{
  "user_id": 1,
  "event_id": 1,
  "quantity": 2
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `user_id` | integer | ✅ | Positive integer, max 999,999,999 |
| `event_id` | integer | ✅ | Positive integer, max 999,999,999 |
| `quantity` | integer | ❌ | Positive integer, max 100 per request. Default: `1` |

**Internal transaction steps:**
```
1. BEGIN TRANSACTION
2. SELECT event WHERE id = ? FOR UPDATE     ← lock event row
3. CHECK event exists
4. VERIFY user exists
5. CHECK if user already has a booking for this event
   ├─ If YES → additionalTickets = requested quantity
   └─ If NO  → additionalTickets = requested quantity
6. CHECK remaining_tickets >= additionalTickets
7. UPDATE remaining_tickets = remaining_tickets - additionalTickets
8. If existing booking → UPDATE bookings SET quantity = (old + new)
   If new booking     → INSERT booking with UUID unique_code
9. COMMIT (or ROLLBACK on any error)
```

**Response `201 Created` — New Booking:**
```json
{
  "success": true,
  "message": "Booking confirmed for 2 ticket(s)",
  "data": {
    "booking_id": 42,
    "user_id": 1,
    "event_id": 1,
    "event_title": "Node.js Workshop",
    "quantity": 2,
    "unique_code": "550e8400-e29b-41d4-a716-446655440000",
    "booking_date": "2026-03-23T10:30:00.000Z"
  }
}
```

**Response `201 Created` — Quantity Updated (re-booking same event):**
```json
{
  "success": true,
  "message": "Booking updated: total quantity is now 5 tickets (added 3 more)",
  "data": {
    "booking_id": 42,
    "user_id": 1,
    "event_id": 1,
    "event_title": "Node.js Workshop",
    "quantity": 5,
    "unique_code": "550e8400-e29b-41d4-a716-446655440000",
    "booking_date": "2026-03-23T10:30:00.000Z"
  }
}
```

> 💡 **Note:** When a booking is updated, `quantity` in the response reflects the **new total** (existing + newly added). The `unique_code` remains unchanged.

> 💡 **Save the `unique_code`** — this is your ticket. Use it for QR code generation and the attendance check-in endpoint.

---

### 4️⃣ GET `/users/:id/bookings` — Get User Bookings

Returns all bookings for a user, joined with full event details. Sorted by `booking_date DESC`.

**Path Parameter:** `id` — the user's ID (positive integer, max 999,999,999)

**Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Priya Sharma",
    "email": "priya@example.com"
  },
  "count": 1,
  "data": [
    {
      "booking_id": 42,
      "booking_date": "2026-03-23T10:30:00.000Z",
      "unique_code": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2,
      "event_id": 1,
      "event_title": "Node.js Workshop",
      "event_description": "Hands-on Express + MySQL session",
      "event_date": "2026-11-15T18:00:00.000Z",
      "total_capacity": 50,
      "remaining_tickets": 48
    }
  ]
}
```

---

### 5️⃣ POST `/events/:id/attendance` — Record Check-In

Scans a booking code at the event door and records attendance. A booking code can only be scanned **once** — duplicate attempts are blocked at both app level (app-level check before insert) and DB level (`UNIQUE` constraint on `booking_code`).

**Path Parameter:** `id` — the event ID (positive integer)

**Request Body:**
```json
{
  "booking_code": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "data": {
    "event_id": 1,
    "event_title": "Node.js Workshop",
    "booking_code": "550e8400-e29b-41d4-a716-446655440000",
    "total_bookings": 13
  }
}
```

> `total_bookings` = `SUM(quantity)` across all bookings for this event — useful for live dashboard displays.

---

### 🔥 Quick cURL Examples

**Create an event:**
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Node.js Workshop","date":"2026-12-15T18:00:00","total_capacity":50}'
```

**Book 2 tickets:**
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"event_id":1,"quantity":2}'
```

**Get user booking history:**
```bash
curl http://localhost:3000/users/1/bookings
```

**Check in at the door:**
```bash
curl -X POST http://localhost:3000/events/1/attendance \
  -H "Content-Type: application/json" \
  -d '{"booking_code":"550e8400-e29b-41d4-a716-446655440000"}'
```

---

## 📖 API Documentation (Swagger)

Interactive OpenAPI 3.0 documentation is served automatically when the server runs:

```
http://localhost:3000/api-docs
```

The Swagger UI allows you to:
- 📄 Read full schema definitions for every request and response
- 🧪 Click **"Try it out"** to call live endpoints directly from the browser
- 🔍 Filter endpoints using the search bar
- 📋 See all possible error responses with example payloads

The documentation is defined in `swagger.yaml` and covers all 5 endpoints with request schemas, success responses, and every possible error response (`400`, `404`, `409`, `500`).

---

## 🧪 Testing with Postman

A pre-built Postman collection is included with all 5 requests pre-configured:

```
EventBooking.postman_collection.json
```

### How to Import

1. Open **Postman**
2. Click **Import** (top left)
3. Select `EventBooking.postman_collection.json`
4. All requests appear under **Event Booking API**

### Recommended Test Order

```
Step 1:  POST /events              → Create event — note the event id
Step 2:  GET  /events              → Verify event appears
Step 3:  POST /bookings            → Book tickets — copy the unique_code
Step 4:  GET  /users/1/bookings    → Verify booking + quantity appear
Step 5:  POST /events/1/attendance → Check in using the unique_code
```

The collection uses a `{{baseUrl}}` variable defaulting to `https://event-booking-api-production.up.railway.app`. Change it in Collection Variables if testing locally.

---

## ❌ Error Handling

### Consistent Error Shape

Every error response — whether validation failure, not found, or unexpected crash — returns the same JSON shape:

```json
{
  "success": false,
  "status": 404,
  "error": "Event not found"
}
```

Validation errors additionally include an `errors` array listing **every broken rule at once**:

```json
{
  "success": false,
  "status": 400,
  "error": "title is required | date must be in the future",
  "errors": [
    "title is required and must be a non-empty string",
    "date must be in the future"
  ]
}
```

### HTTP Status Code Reference

| Status | When it fires | Example |
|---|---|---|
| `400 Bad Request` | Missing/invalid request body fields or invalid path params | `title is required`, `booking_code must be a valid UUID v4` |
| `404 Not Found` | Resource does not exist | `Event not found`, `User not found`, `Invalid booking code for this event` |
| `409 Conflict` | Business rule violation | `No tickets remaining`, `Only 2 tickets available`, `This ticket has already been scanned` |
| `500 Internal Server Error` | Unexpected crash | Stack trace logged server-side only |

### MySQL Error Codes Handled

The global error handler catches raw MySQL errors and converts them to clean API responses:

| MySQL Code | HTTP Status | Meaning |
|---|---|---|
| `ER_DUP_ENTRY` | `409` | UNIQUE constraint violated |
| `ER_NO_REFERENCED_ROW_2` | `404` | FK reference doesn't exist |
| `ER_DATA_TOO_LONG` | `400` | Field value exceeds column size |
| `entity.parse.failed` | `400` | Malformed JSON in request body |

### The `asyncHandler` Pattern

Instead of wrapping every route in `try/catch`:

```js
// ❌ Without asyncHandler — repeated in every route
router.get("/events", async (req, res, next) => {
  try {
    // ... logic
  } catch (err) {
    next(err); // must remember this every time
  }
});

// ✅ With asyncHandler — clean and DRY
router.get("/events", asyncHandler(async (req, res) => {
  // ... logic — errors auto-forwarded to errorHandler
}));
```

---

## ✅ Input Validation

Validation runs in **phases** to give the most helpful error messages possible.

### Two-Phase Validation Strategy

```js
// Phase 1: assertAll() — checks ALL fields at once and reports everything missing
assertAll([
  [isNonEmpty(title),            "title is required"],
  [date !== undefined,           "date is required"],
  [total_capacity !== undefined, "total_capacity is required"],
]);

// Phase 2: assertChain() — short-circuits on first failure
// Only runs if Phase 1 passes (date is present and non-null)
assertChain([
  [isValidDate(date),              "date must be a valid ISO date-time string"],
  [isFutureDate(date),             "date must be in the future"],
  [isReasonableFutureDate(date),   "date cannot be more than 2 years from now"],
]);
```

### Why Two Phases?

- If `date` is **missing** → report `"date is required"` (not "invalid format")
- If `date` is **present but wrong format** → report `"date must be a valid ISO string"` (not "must be future")
- If `date` is **valid format but in the past** → report `"date must be in the future"`

This prevents confusing chains of errors from a single root cause.

### Validators by Route

| Route | Validator(s) | Key Rules |
|---|---|---|
| `POST /events` | `validateCreateEvent` | title: required, non-empty, max 200 chars, no HTML/JS; date: required, valid ISO, future, ≤2 years; capacity: required, positive int, ≤100,000; description: optional, max 2,000 chars, no HTML/JS |
| `POST /bookings` | `validateCreateBooking` | user_id + event_id: required, positive integers; quantity: optional positive int, max 100 |
| `POST /events/:id/attendance` | `validateEventId` + `validateAttendance` | event id: positive int ≤999,999,999; booking_code: non-empty, valid UUID v4 format |
| `GET /users/:id/bookings` | `validateUserId` | user id: positive integer ≤999,999,999 |

### XSS Prevention

Input is rejected at validation time if it contains HTML tags, JavaScript patterns, or HTML entities (e.g., `<script>`, `&lt;`). Additionally, all string fields (`title`, `description`, `name`) are passed through `escape-html` before being included in any response.

---

## 🧠 Architecture & Design Decisions

### 1. 🔒 Race Condition Prevention in `POST /bookings`

**The problem:** Two users simultaneously see `remaining_tickets = 1`, both pass the availability check, and both book — resulting in `remaining_tickets = -1` (overselling).

**The solution:** `SELECT ... FOR UPDATE` inside a transaction:

```js
const conn = await pool.getConnection();   // dedicated connection from pool
await conn.beginTransaction();

// This locks the event row — all other transactions
// trying to read this row will BLOCK until we commit
const [[event]] = await conn.query(
  `SELECT id, title, remaining_tickets FROM events WHERE id = ? FOR UPDATE`,
  [event_id]
);

if (event.remaining_tickets < requestedTickets) {
  throw AppError.conflict(`Only ${event.remaining_tickets} tickets available`);
}

// Atomically decrement by the number of tickets actually being added
await conn.query(
  `UPDATE events SET remaining_tickets = remaining_tickets - ? WHERE id = ?`,
  [additionalTickets, event_id]
);

await conn.commit();
```

The `finally { conn.release() }` block guarantees the connection always returns to the pool, even if an error occurs mid-transaction.

---

### 2. 🔁 Booking Quantity Update vs. Duplicate Rejection

Rather than returning a `409 Conflict` when a user tries to book the same event twice, the controller detects the existing booking and **increments its quantity** instead:

```js
const [[existingBooking]] = await conn.query(
  `SELECT id, quantity FROM bookings WHERE user_id = ? AND event_id = ?`,
  [user_id, event_id]
);

if (existingBooking) {
  // Only check/decrement the additional tickets requested
  const additionalTickets = requestedTickets;
  // UPDATE bookings SET quantity = (existingQty + requestedQty) WHERE id = ?
} else {
  // INSERT new booking with fresh UUID
}
```

The `UNIQUE(user_id, event_id)` constraint in the schema still acts as a safety net at the database level.

---

### 3. 🏗️ MVC Separation of Concerns

Each layer has exactly one responsibility:

| Layer | Responsibility | Does NOT do |
|---|---|---|
| **Routes** | Map HTTP method + path to a controller | No queries, no validation, no logic |
| **Controllers** | Business logic + DB queries + response | No HTTP parsing, no error formatting |
| **Middlewares** | Validation, error classes, async wrappers | No business logic |
| **config/db.js** | Connection pool singleton | No queries |

Routes are deliberately thin — the entire `routes/bookings.js` is:
```js
router.post("/", asyncHandler(createBooking));
```

All routes are aggregated in `routes/index.js`, which is the only route file imported by `app.js`. Adding a new resource requires only one new line in `index.js`.

---

### 4. ✂️ `app.js` / `server.js` Separation

`server.js` does exactly one thing — bind a port:
```js
const app = require("./app");
app.listen(PORT, () => { ... });
```

All Express configuration (body parser, Swagger UI, route mounting, error handler) lives in `app.js`. This separation means:
- Tests can `require("./app")` without binding a port
- Switching from HTTP to HTTPS only touches `server.js`

---

### 5. 🎯 Typed Error System with `AppError`

Instead of scattered `res.status(400).json({...})` calls, every intentional error is thrown as a typed `AppError`:

```js
throw AppError.notFound("Event not found");    // 404
throw AppError.conflict("Sold out");           // 409
throw AppError.badRequest("title required");   // 400
```

The `isAppError: true` flag lets the global `errorHandler` distinguish intentional errors from unexpected crashes — and respond appropriately to each.

---

### 6. 🆔 UUID as Booking Code

`uuid` v4 generates a cryptographically random 128-bit identifier (e.g. `550e8400-e29b-41d4-a716-446655440000`). This is used as the booking ticket because:

- ✅ Globally unique — collision probability is negligible
- ✅ Unpredictable — cannot be guessed or enumerated by a bad actor
- ✅ QR-code ready — any QR library can encode a UUID string
- ✅ Validated at app level (UUID v4 regex in `validateAttendance`) and DB level (`UNIQUE` constraint)

When a booking's quantity is updated, the original `unique_code` is preserved so existing QR codes remain valid.

---

### 7. 🗃️ Connection Pool vs Dedicated Connection

| Scenario | Connection Type | Why |
|---|---|---|
| Regular queries | `pool.query()` | Shared pool — efficient for stateless queries |
| Booking transaction | `pool.getConnection()` | Dedicated connection — transactions must stay on one connection until commit/rollback |

---

## 🐳 Docker Deployment

Run the entire stack — API + MySQL — with a **single command**. No local MySQL installation needed.

### Files Included

| File | Purpose |
|---|---|
| `Dockerfile` | Builds the Node.js API image using `node:22-alpine`; installs only production deps (`--omit=dev`) |
| `docker-compose.yml` | Orchestrates API + MySQL 8 containers; waits for DB health before starting API |
| `.dockerignore` | Excludes `node_modules`, `.env`, logs, `.git`, and editor folders from the image |

---

### Step 1 — Make sure Docker is installed

Download from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) and confirm:

```bash
docker --version
docker-compose --version
```

---

### Step 2 — Create your `.env` file

```bash
cp .env.example .env
```

Fill in `.env`:
```env
PORT=3000
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=root1234
DB_NAME=event_booking
```

> ⚠️ `DB_HOST` must be `mysql` (the Docker service name) — not `localhost`.

---

### Step 3 — Build and start everything

```bash
docker-compose up --build
```

Docker will:
1. 🔨 Build the Node.js API image
2. 🗄️ Pull and start MySQL 8.0
3. 📋 Auto-import `models/schema.sql` into the database
4. ⏳ Wait for MySQL to be healthy before starting the API (`condition: service_healthy`)
5. 🚀 Start the API server

**Expected output:**
```
event_booking_db  | ready for connections
event_booking_api | Server   → http://localhost:3000
event_booking_api | API Docs → http://localhost:3000/api-docs
```

---

### Step 4 — Seed test users

```bash
docker exec -it event_booking_db mysql -u root -proot1234 event_booking \
  -e "INSERT INTO users (name, email) VALUES ('Priya Sharma','priya@example.com'),('Arjun Mehta','arjun@example.com');"
```

---

### Useful Docker Commands

```bash
# Start in background (detached mode)
docker-compose up -d --build

# View live logs
docker-compose logs -f api

# Stop all containers
docker-compose down

# Stop and DELETE database data (full reset)
docker-compose down -v

# Rebuild only the API image (after code changes)
docker-compose up --build api
```

---

### How it Works Internally

```
┌─────────────────────────────────────────────────┐
│              docker-compose.yml                  │
│                                                  │
│  ┌──────────────────────┐  ┌─────────────────┐  │
│  │  api (port 3000)      │  │  mysql (3306)   │  │
│  │  node:22-alpine       │  │  mysql:8.0      │  │
│  │                       │  │                 │  │
│  │  DB_HOST=mysql  ──────┼──► event_booking   │  │
│  │  (Docker DNS)         │  │  (auto-created) │  │
│  └──────────────────────┘  └─────────────────┘  │
│                                                  │
│  mysql_data volume ── persists DB across restarts│
└─────────────────────────────────────────────────┘
```

`DB_HOST=mysql` works because Docker Compose creates an internal DNS where each service is reachable by its **service name**.

---

## ☁️ Railway Deployment (Live Server)

[Railway](https://railway.app) lets you deploy both the Node.js API and a MySQL database for **free** — no credit card needed.

### Step 1 — Create a Railway account

Go to [railway.app](https://railway.app) → **Sign up with GitHub**

---

### Step 2 — Deploy MySQL database

1. Click **New Project**
2. Select **Deploy a template** → search **MySQL** → click it
3. Railway provisions a MySQL instance instantly
4. Click the MySQL service → go to **Variables** tab
5. Note down these values — you'll need them:

```
MYSQL_HOST     → shown as "Host" under Connect tab
MYSQL_PORT     → 3306
MYSQL_USER     → root
MYSQL_PASSWORD → auto-generated
MYSQL_DATABASE → railway
```

---

### Step 3 — Import your schema into Railway MySQL

In the Railway MySQL service → **Connect** tab → copy the **MySQL CLI** connection string. It looks like:

```bash
mysql -h <host> -P <port> -u root -p<password> railway
```

Run it and paste your schema:

```bash
mysql -h <host> -P <port> -u root -p<password> railway < models/schema.sql
```

Then seed users:
```sql
INSERT INTO users (name, email) VALUES
  ('Priya Sharma', 'priya@example.com'),
  ('Arjun Mehta',  'arjun@example.com');
```

---

### Step 4 — Deploy the Node.js API

1. In your Railway project, click **New Service** → **GitHub Repo**
2. Select your `event-booking-api` repository
3. Railway auto-detects Node.js and runs `npm start`

---

### Step 5 — Set environment variables

In the API service → **Variables** tab → add:

```env
PORT=3000
DB_HOST=<your Railway MySQL host>
DB_USER=root
DB_PASSWORD=<your Railway MySQL password>
DB_NAME=railway
```

> 💡 You can also click **"Add from service"** and select your MySQL service — Railway will auto-fill the DB variables.

---

### Step 6 — Get your live URL

Railway auto-generates a public URL for your API:

```
https://event-booking-api-production.up.railway.app
```

Click **Settings** → **Networking** → **Generate Domain** if it hasn't appeared yet.

**Test it:**
```bash
curl https://event-booking-api-production.up.railway.app/events
```

Your Swagger docs will be live at:
```
https://event-booking-api-production.up.railway.app/api-docs
```

---

### Railway vs Docker — When to Use Which

| Scenario | Use |
|---|---|
| Running locally without installing MySQL | 🐳 **Docker** |
| Sharing a live URL with your reviewer | ☁️ **Railway** |
| CI/CD and automated testing | 🐳 **Docker** |
| Free public deployment for assignment submission | ☁️ **Railway** |

---

<div align="center">

---

**Built with ❤️ using Node.js, Express & MySQL**

*Star ⭐ this repo if it helped you!*

</div>