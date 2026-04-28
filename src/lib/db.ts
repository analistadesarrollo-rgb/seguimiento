import mysql from 'mysql2/promise';
import fs from 'node:fs';
import path from 'node:path';

const requiredEnv = (key: string) => {
    const value = process.env[key] || getEnvFromFile(key);

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
};

const getEnvFromFile = (key: string) => {
    const candidateFiles = [path.join(process.cwd(), '.env'), '/app/.env'];

    for (const filePath of candidateFiles) {
        try {
            if (!fs.existsSync(filePath)) {
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));

            if (match?.[1]) {
                return match[1].trim().replace(/^['"]|['"]$/g, '');
            }
        } catch {
            continue;
        }
    }

    return null;
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
