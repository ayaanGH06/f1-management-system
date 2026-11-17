import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
export const pool = global._pool ||= mysql.createPool({
  host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DB });
const client = global._mongo ||= new MongoClient(process.env.MONGO_URI);
export async function mongo() { await client.connect(); return client.db(process.env.MONGO_DB); }
