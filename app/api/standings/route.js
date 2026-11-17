import { pool } from '@/lib/db';
import { getUser, json } from '@/lib/auth';
export async function GET(req) {
  if (!getUser(req)) return json({ error: 'Login required' }, 401);
  const [drivers] = await pool.query(
    'SELECT Driver_Name, Year, Total_Points, Wins, Races FROM v_driver_standings HAVING Total_Points >= 0 ORDER BY Total_Points DESC');
  const [teams] = await pool.query(
    `SELECT t.Team_Name, SUM(p.Points) AS Points FROM PARTICIPATES_IN p
     JOIN CAR c ON c.Car_ID = p.Car_Used JOIN TEAM t ON t.Team_ID = c.Team_ID
     GROUP BY t.Team_ID, t.Team_Name ORDER BY Points DESC`);
  return json({ drivers, teams });
}
