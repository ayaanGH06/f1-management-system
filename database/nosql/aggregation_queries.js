db = db.getSiblingDB('f1_telemetry');

print("\n--- MongoDB Aggregation: Average Race Speed & Pit Stop Summary by Driver ---");

db.telemetry.aggregate([
  {
    $match: { race_id: 1001 }
  },
  {
    $group: {
      _id: "$driver_id",
      avg_speed_kmh: { $avg: "$telemetry_data.speed_kmh" },
      max_speed_kmh: { $max: "$telemetry_data.speed_kmh" },
      total_pit_stops: {
        $sum: { $cond: [{ $ifNull: ["$pit_stop", false] }, 1, 0] }
      },
      avg_pit_duration: { $avg: "$pit_stop.duration_sec" }
    }
  },
  {
    $project: {
      driver_id: "$_id",
      avg_speed_kmh: { $round: ["$avg_speed_kmh", 2] },
      max_speed_kmh: 1,
      total_pit_stops: 1,
      avg_pit_duration: { $round: ["$avg_pit_duration", 2] },
      _id: 0
    }
  },
  { $sort: { avg_speed_kmh: -1 } }
]).forEach(printjson);