import { pool } from '@/lib/db';
import { getUser, json } from '@/lib/auth';
export async function GET(req) {
  if (!getUser(req)) return json({ error: 'Login required' }, 401);
  const q = (req.nextUrl.searchParams.get('q') || '').replace(/[^\w ]/g, '').trim();
  const [rows] = q
    ? await pool.query('SELECT * FROM DRIVER WHERE MATCH(Driver_Name) AGAINST(? IN BOOLEAN MODE)', [q + '*'])
    : await pool.query('SELECT * FROM DRIVER');
  return json(rows);
}
