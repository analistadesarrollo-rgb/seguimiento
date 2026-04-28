import mysql from 'mysql2/promise';

const requiredEnv = (key: string) => {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
};

let pool: mysql.Pool | null = null;

const ensurePool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: requiredEnv('DB_HOST'),
            user: requiredEnv('DB_USER'),
            password: requiredEnv('DB_PASS'),
            database: requiredEnv('DB_NAME'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    return pool;
};

export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await ensurePool().query(sql, params || []);
    return rows as T[];
}

export function getPool() {
    return ensurePool();
}

export default pool;
