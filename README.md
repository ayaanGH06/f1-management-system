# Formula 1 Racing Database (DBMS Level 3)
Stack: Next.js 14 (UI + route handlers) | MySQL 8 (relational core) | MongoDB (lap telemetry) | JWT auth (admin / viewer)

## Setup
1. `mysql -u root -p < db/schema.sql`
2. `cp .env.example .env.local` and fill in values
3. `npm install && npm run seed && npm run dev` -> http://localhost:3000
Logins: admin/admin123 (can add, edit, delete results), viewer/viewer123 (read only). Node 20+.

## Design changes vs original ER
- NEW entity APP_USER (auth + roles). PARTICIPATES_IN.Car_Used is now a real FK to CAR (was missing).
- Added CHECK / UNIQUE constraints (position range, status values, unique position per race, unique year).
- Lap-by-lap data lives in MongoDB (see db/mongo.md).
Update your ER diagram: add APP_USER, and draw PARTICIPATES_IN -> CAR (N:1).

## Requirement map
- DDL CREATE/ALTER/DROP, PK/FK/constraints/indexes/view: db/schema.sql
- DML, JOIN/GROUP BY/HAVING/subquery: db/queries.sql
- Advanced SQL: transaction + stored procedure, triggers, function, view, full-text index
- NoSQL: aggregation pipeline (app/api/laps)
- DB-level validation: CHECK, UNIQUE, FK, procedure SIGNAL
- Env vars: .env.local | Roles: app/api/results

## Still to do yourselves
Screenshots, test results table, data dictionary, architecture diagram, justification write-up, Git commits per member.
