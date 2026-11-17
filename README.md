# Formula 1 Racing Database (DBMS Level 3)
Stack: Next.js 14 (UI + route handlers) | MySQL 8 (relational core) | MongoDB (lap telemetry) | JWT auth (admin / viewer)

## Setup
Use Node 20.6+ and running local MySQL 8 and MongoDB servers. Run commands from the repository folder.

1. Stop the dev server (Ctrl+C), then run `node scripts/configure-env.mjs`.
   This adds the new env keys, reuses old SQL_*/MONGODB_URI settings when present, keeps existing values, and creates a local JWT secret. It never prints credentials. If needed, edit `.env.local` locally to set `MYSQL_PASSWORD`. Never paste secrets into chat or commit this file.
2. **Fresh dataset reset:** `mysql -u root -p < db/schema.sql`. This drops and rebuilds `Formula_Racing_DB`, including its existing rows. Run only when you intend to replace this project's SQL dataset.
3. `npm install && npm run seed`. This creates admin/viewer demo accounts and replaces every document in `f1_telemetry.lap_times` with 60 generated lap records (6 drivers, 10 laps each, British GP). It does not touch the older `telemetry` collection. Use demo credentials only for a local course demo, never for a public deployment.
4. `npm run dev`, then open http://localhost:3000.

Logins: admin/admin123 (add, edit, delete results), viewer/viewer123 (read only).
`.env.example` lists the settings. The helper defaults to the new `Formula_Racing_DB` database; if `MYSQL_DB` already exists in your settings, check it points there. The new dataset uses driver IDs 1-6 and race IDs 1-2, not the previous app's IDs.

Demo: note Max25 and McLaren30 in Standings. Race Results -> Italian GP -> Lando Norris + McLaren MCL40 + position1 + Finished + lap00:01:20.500 -> Save. Standings immediately shows Lando43 and McLaren55. Edit/delete from Race Results to demonstrate UPDATE/DELETE; a wrong driver/car pair is rejected by the procedure. Lap Telemetry -> British GP -> Load shows Mongo aggregates. Italian GP has no seeded lap records. This is generated demo data, not a live racing feed.

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
