# Formula 1 Racing Management System (DBMS Level 3 Project)

A full-stack Formula 1 Racing Management System demonstrating **Polyglot Persistence** by combining a normalized **MySQL** relational database for structured championship entities with a **MongoDB** document store for high-frequency race telemetry analytics.

---

## Tech Stack

- **Frontend & API Layer:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Relational Database (OLTP):** MySQL 8.0 (`Formula_Racing_DB`)
- **NoSQL Database (Telemetry/Analytics):** MongoDB (`f1_telemetry`)
- **Database Drivers:** `mysql2` (Connection Pooling), official `mongodb` Node.js driver
- **Authentication:** HMAC-SHA256 signed HTTP-only session cookies (`src/lib/auth.ts`)

---

## Database Architecture

### 1. Relational Schema (`Formula_Racing_DB` — 8 Normalized Tables)
- `SEASON` (`Season_ID`, `Season_Name`, `Year`, `Champion_Team_ID`)
- `TEAM` (`Team_ID`, `Team_Name`, `Country`, `Team_Principal`)
- `DRIVER` (`Driver_ID`, `Driver_Name`, `Nationality`, `Date_Of_Birth`, `Car_Number`)
- `CAR` (`Car_ID`, `Car_Model`, `Manufacturing_Year`, `Engine_Manufacturer`, `Team_ID`)
- `CIRCUIT` (`Circuit_ID`, `Circuit_Name`, `Country`, `Circuit_Length`, `Number_Of_Laps`)
- `RACE` (`Race_ID`, `Race_Name`, `Race_Date`, `Season_ID`, `Circuit_ID`)
- `DRIVES_FOR` (`Driver_ID`, `Team_ID`, `Season_ID`)
- `PARTICIPATES_IN` (`Driver_ID`, `Race_ID`, `Finishing_Position`, `Points`, `Race_Status`, `Fastest_Lap`, `Car_Used`)

### 2. Advanced SQL Features (`database/sql/03_advanced_features.sql`)
- **View (`v_ConstructorStandings`):** Dynamically aggregates total constructor championship points and race participation across teams.
- **B-Tree Indexes (`idx_participates_finishing`, `idx_race_date_season`):** Optimizes leaderboard sorting and seasonal schedule lookups.
- **Stored Procedure (`sp_GetDriverSummary`):** Computes career statistics, total points, and best finish for a given `Driver_ID`.
- **Integrity Trigger (`trg_ValidateRacePoints`):** Enforces domain integrity `BEFORE INSERT` on `PARTICIPATES_IN` by blocking negative point entries (`SIGNAL SQLSTATE '45000'`).
- **DDL Schema Evolution (`ALTER TABLE`):** Adds `Car_Number` to `DRIVER` and `chk_finishing_position` `CHECK` constraint on `PARTICIPATES_IN`.

### 3. NoSQL Telemetry Store (`f1_telemetry.telemetry`)
- Enforces `$jsonSchema` validation rules for lap-by-lap telemetry metrics (`speed_kmh`, `throttle_pct`, `brake_pct`, `gear`, `drs_active`) and nested `pit_stop` sub-documents.
- **Aggregation Pipeline (`database/nosql/aggregation_queries.js`):** Computes average lap speed, top speed, total pit stops, and average pit duration per driver.

---

## Local Setup & Execution

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server running on `localhost:3306`
- MongoDB Community Server running on `localhost:27017`

### 2. Environment Configuration
Create a `.env.local` file in the project root (all variables are required):

    SQL_HOST=localhost
    SQL_PORT=3306
    SQL_USER=root
    SQL_PASSWORD=your_mysql_password
    SQL_DATABASE=Formula_Racing_DB
    MONGODB_URI=mongodb://localhost:27017/f1_telemetry
    JWT_SECRET=replace_with_a_long_random_secret_string
    ADMIN_USER=admin
    ADMIN_PASSWORD=replace_with_a_strong_admin_password

### 3. Initialize MySQL Database (`Formula_Racing_DB`)
Run the DDL schema, seed data, and advanced SQL features scripts in sequence:

    mysql -u root -p < database/sql/01_ddl_schema.sql
    mysql -u root -p < database/sql/02_dml_seed.sql
    mysql -u root -p < database/sql/03_advanced_features.sql

### 4. Initialize MongoDB Telemetry Store (`f1_telemetry`)
Create the validated collection, compound index, and seed documents:

    mongosh "mongodb://localhost:27017/f1_telemetry" < database/nosql/collections_setup.js

Run the standalone aggregation pipeline verification:

    mongosh "mongodb://localhost:27017/f1_telemetry" < database/nosql/aggregation_queries.js

### 5. Install Dependencies & Start the Application

    npm install
    npm run dev

Open `http://localhost:3000` in your browser:
- `/` — Public Constructor Standings dashboard
- `/telemetry` — Live MongoDB Race Telemetry analytics
- `/admin` — Race Control Admin Portal (full Driver CRUD & Trigger validation)

### 6. Run End-to-End Verification Suite
With the Next.js server running on `http://localhost:3000`:

    chmod +x scripts/verify-system.sh
    ./scripts/verify-system.sh
