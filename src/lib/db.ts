import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: '172.20.1.92',
    user: 'cliente',
    password: 'adminadmon',
    database: 'appseguimiento',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await pool.query(sql, params || []);
    return rows as T[];
}

export function getPool() {
    return pool;
}

export default pool;
