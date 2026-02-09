import mysql from 'mysql2/promise';

const dbConfig = {
  host: "172.20.1.92",
  user: "cliente",
  password: "adminadmon",
  database: "appseguimiento",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
const pool = mysql.createPool(dbConfig);
async function query(sql, params) {
  const [rows] = await pool.query(sql, params || []);
  return rows;
}

export { query as q };
