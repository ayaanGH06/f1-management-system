import { mongo } from '@/lib/db';
import { getUser, json } from '@/lib/auth';
export async function GET(req) {
  if (!getUser(req)) return json({ error: 'Login required' }, 401);
  const race = Number(req.nextUrl.searchParams.get('race_id') || 1);
  const db = await mongo();
  const rows = await db.collection('lap_times').aggregate([
    { $match: { race_id: race } },
    { $group: { _id: '$driver_id', avg_ms: { $avg: '$lap_time_ms' }, best_ms: { $min: '$lap_time_ms' }, laps: { $sum: 1 } } },
    { $sort: { best_ms: 1 } },
    { $project: { _id: 0, driver_id: '$_id', avg_ms: { $round: ['$avg_ms', 0] }, best_ms: 1, laps: 1 } }
  ]).toArray();
  return json(rows);
}
