import { NextResponse } from 'next/server';
import { getMongoDb } from '../../../lib/db-mongo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raceId = Number(searchParams.get('raceId')) || 1001;

    const db = await getMongoDb();
    
    const telemetrySummary = await db.collection('telemetry').aggregate([
      { $match: { race_id: raceId } },
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
    ]).toArray();

    return NextResponse.json({ success: true, data: telemetrySummary });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}