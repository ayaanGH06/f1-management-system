import jwt from 'jsonwebtoken';
export const sign = (u) => jwt.sign({ id: u.User_ID, role: u.Role }, process.env.JWT_SECRET, { expiresIn: '2h' });
export function getUser(req) {
  try { return jwt.verify(req.cookies.get('token')?.value, process.env.JWT_SECRET); } catch { return null; }
}
export const json = (d, status = 200) => Response.json(d, { status });
