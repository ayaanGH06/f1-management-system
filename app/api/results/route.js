import { pool } from '@/lib/db';
import { getUser, json } from '@/lib/auth';
const admin = (req) => { const u = getUser(req); return !u ? [null, json({ error: 'Login required' }, 401)] : u.role !== 'admin' ? [null, json({ error: 'Admins only' }, 403)] : [u, null]; };
const fail = (e) => json({ error: e.sqlMessage || e.message }, 400);

export async function GET(req) {                       // SELECT with JOINs
  if (!getUser(req)) return json({ error: 'Login required' }, 401);
  const race = Number(req.nextUrl.searchParams.get('race_id') || 1);
  const [rows] = await pool.query(
    `SELECT p.Driver_ID, p.Car_Used, d.Driver_Name, t.Team_Name, p.Finishing_Position, p.Race_Status, p.Points, p.Fastest_Lap
     FROM PARTICIPATES_IN p JOIN DRIVER d ON d.Driver_ID = p.Driver_ID
     LEFT JOIN CAR c ON c.Car_ID = p.Car_Used LEFT JOIN TEAM t ON t.Team_ID = c.Team_ID
     WHERE p.Race_ID = ? ORDER BY p.Finishing_Position IS NULL, p.Finishing_Position`, [race]);
  return json(rows);
}
export async function POST(req) {                      // INSERT via stored procedure + transaction
  const [, err] = admin(req); if (err) return err;
  const b = await req.json();
  try { await pool.query('CALL sp_record_result(?,?,?,?,?,?)', [b.driver, b.race, b.pos || null, b.status, b.lap || null, b.car]); return json({ ok: true }); }
  catch (e) { return fail(e); }
}
export async function PUT(req) {                       // UPDATE (trigger recalculates points)
  const [, err] = admin(req); if (err) return err;
  const b = await req.json();
  try {
    await pool.query('UPDATE PARTICIPATES_IN SET Finishing_Position=?, Race_Status=?, Fastest_Lap=? WHERE Driver_ID=? AND Race_ID=?',
      [b.pos || null, b.status, b.lap || null, b.driver, b.race]);
    return json({ ok: true });
  } catch (e) { return fail(e); }
}
export async function DELETE(req) {                    // DELETE
  const [, err] = admin(req); if (err) return err;
  const p = req.nextUrl.searchParams;
  try { await pool.query('DELETE FROM PARTICIPATES_IN WHERE Driver_ID=? AND Race_ID=?', [p.get('driver'), p.get('race')]); return json({ ok: true }); }
  catch (e) { return fail(e); }
}
