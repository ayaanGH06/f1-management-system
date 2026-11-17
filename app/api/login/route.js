import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { sign } from '@/lib/auth';
export async function POST(req) {
  try {
  const { username, password } = await req.json();
  const [rows] = await pool.query('SELECT * FROM APP_USER WHERE Username = ?', [username]);
  if (!rows[0] || !(await bcrypt.compare(password || '', rows[0].Password_Hash)))
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const res = NextResponse.json({ role: rows[0].Role });
  res.cookies.set('token', sign(rows[0]), { httpOnly: true, path: '/' });
  return res;
  } catch {
    return NextResponse.json({ error: 'Login setup failed. Check .env.local, import db/schema.sql, then run npm run seed. See the server terminal for connection details.' }, { status: 503 });
  }
}
