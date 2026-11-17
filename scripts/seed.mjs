import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
const db = await mysql.createConnection({ host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DB });
for (const [u, p, r] of [['admin', 'admin123', 'admin'], ['viewer', 'viewer123', 'viewer']])
  await db.query('INSERT IGNORE INTO APP_USER (Username, Password_Hash, Role) VALUES (?,?,?)', [u, await bcrypt.hash(p, 10), r]);
const m = new MongoClient(process.env.MONGO_URI); await m.connect();
const c = m.db(process.env.MONGO_DB).collection('lap_times');
await c.deleteMany({});
const docs = [];
for (let d = 1; d <= 6; d++) for (let l = 1; l <= 10; l++) {
  const s = [28000 + Math.random() * 800, 31000 + Math.random() * 800, 28000 + Math.random() * 800].map(Math.round);
  docs.push({ race_id: 1, driver_id: d, lap_number: l, lap_time_ms: s[0] + s[1] + s[2], tyre: ['SOFT', 'MEDIUM', 'HARD'][l % 3], sectors_ms: s });
}
await c.insertMany(docs);
await c.createIndex({ race_id: 1, driver_id: 1, lap_number: 1 });
console.log('seeded'); await db.end(); await m.close();
