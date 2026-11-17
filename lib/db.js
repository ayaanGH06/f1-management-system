import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
export const pool = global._pool ||= mysql.createPool({
  host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DB, dateStrings: true });
export async function mongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing. Run node scripts/configure-env.mjs and restart the app.');
  const client = global._mongo ||= new MongoClient(uri);
  await client.connect();
  return client.db(process.env.MONGO_DB || 'f1_telemetry');
}
