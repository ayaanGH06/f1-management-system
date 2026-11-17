# MongoDB model: `lap_times` (database f1_telemetry)
Document: { race_id, driver_id, lap_number, lap_time_ms, tyre: "SOFT|MEDIUM|HARD", sectors_ms: [s1,s2,s3] }
Why NoSQL: ~50 laps x 20 drivers = 1000+ small append-only docs per race with a flexible shape (sectors, tyres, later weather/pit data). Keeping them out of MySQL avoids a huge narrow table and fits the document model.
Index: { race_id:1, driver_id:1, lap_number:1 } (supports $match + $group)
Aggregation (app/api/laps): $match race_id -> $group by driver_id {avg, best, count} -> $sort best -> $project
Link to SQL: race_id / driver_id are the MySQL primary keys (SQL is the source of truth for master data).
