import { pool } from '@/lib/db';
import { getUser, json } from '@/lib/auth';
export async function GET(req) {
  if (!getUser(req)) return json({ error: 'Login required' }, 401);
  const [drivers] = await pool.query('SELECT Driver_ID, Driver_Name FROM DRIVER ORDER BY Driver_Name');
  const [cars] = await pool.query('SELECT c.Car_ID, c.Car_Model, t.Team_Name FROM CAR c JOIN TEAM t ON t.Team_ID = c.Team_ID');
  const [races] = await pool.query('SELECT r.Race_ID, r.Race_Name, s.Year FROM RACE r JOIN SEASON s ON s.Season_ID = r.Season_ID ORDER BY r.Race_Date');
  return json({ drivers, cars, races });
}
