# Formula 1 Racing Management System (DBMS Level 3 Project)

A full-stack Formula 1 Racing Management System demonstrating **Polyglot Persistence** by combining a normalized **MySQL** relational database for structured championship entities with a **MongoDB** document store for high-frequency race telemetry analytics.

---

## Tech Stack

* **Frontend & API Layer:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Relational Database (OLTP):** MySQL 8.0 (`Formula_Racing_DB`)
* **NoSQL Database (Telemetry/Analytics):** MongoDB (`f1_telemetry`)
* **Database Drivers:** `mysql2` (Connection Pooling), official `mongodb` Node.js driver

---

## Database Architecture

### 1. Relational Schema (`Formula_Racing_DB` — 8 Normalized Tables)
* `SEASON` (`Season_ID`, `Year`, `Total_Races`, `Champion_Team_ID`)
* `TEAM` (`Team_ID`, `Team_Name`, `Country`, `Team_Principal`)
* `DRIVER` (`Driver_ID`, `Driver_Name`, `Nationality`, `Date_Of_Birth`)
* `CAR` (`Car_ID`, `Car_Model`, `Engine_Supplier`, `Chassis`, `Team_ID`)
* `CIRCUIT` (`Circuit_ID`, `Circuit_Name`, `Location`, `Track_Length_KM`, `Lap_Record`)
* `RACE` (`Race_ID`, `Race_Name`, `Race_Date`, `Season_ID`, `Circuit_ID`)
* `DRIVES_FOR` (`Driver_ID`, `Team_ID`, `Season_ID`, `Contract_Start`, `Contract_End`)
* `PARTICIPATES_IN` (`Driver_ID`, `Race_ID`, `Finishing_Position`, `Points`, `Race_Status`, `Fastest_Lap`, `Car_Used`)

### 2. Advanced SQL Features (`database/sql/03_advanced_features.sql`)
* **View (`v_ConstructorStandings`):** Dynamically aggregates total constructor championship points and race participation across teams.
* **B-Tree Indexes (`idx_participates_finishing`, `idx_race_date_season`):** Optimizes leaderboard sorting and seasonal schedule lookups.
* **Stored Procedure (`sp_GetDriverSummary`):** Computes career statistics, total points, and best finish for a given `Driver_ID`.
* **Integrity Trigger (`trg_ValidateRacePoints`):** Enforces domain integrity `BEFORE INSERT` on `PARTICIPATES_IN` by blocking negative point entries (`SIGNAL SQLSTATE '45000'`).

### 3. NoSQL Telemetry Store (`f1_telemetry.telemetry`)
* Enforces `$jsonSchema` validation rules for lap-by-lap telemetry metrics (`speed_kmh`, `throttle_pct`, `brake_pct`, `gear`, `drs_active`) and nested `pit_stop` sub-documents.
* **Aggregation Pipeline (`database/nosql/aggregation_queries.js`):** Computes average lap speed, top speed, total pit stops, and average pit duration per driver.

---

## Local Setup & Execution

### 1. Prerequisites
* Node.js (v18+)
* MySQL Server running on `localhost:3306`
* MongoDB Community Server running on `localhost:27017`

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
SQL_HOST=localhost
SQL_PORT=3306
SQL_USER=root
SQL_PASSWORD=your_mysql_password
SQL_DATABASE=Formula_Racing_DB
MONGODB_URI=mongodb://localhost:27017/f1_telemetry