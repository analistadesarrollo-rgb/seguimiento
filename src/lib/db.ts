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
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}

export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
    const connection = getPool();
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
}
