import mysql from 'mysql2/promise';

const requiredEnv = (key: string) => {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
};

// Database configuration
const dbConfig = {
    host: requiredEnv('DB_HOST'),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASS'),
    database: requiredEnv('DB_NAME'),
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
