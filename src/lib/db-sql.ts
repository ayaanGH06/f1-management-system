import mysql from 'mysql2/promise';

// Create a connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.SQL_HOST || 'localhost',
  port: Number(process.env.SQL_PORT) || 3306,
  user: process.env.SQL_USER || 'root',
  password: process.env.SQL_PASSWORD || '',
  database: process.env.SQL_DATABASE || 'Formula_Racing_DB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function querySQL<T = any>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}

export default pool;