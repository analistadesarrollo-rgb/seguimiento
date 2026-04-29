import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';

interface Usuario {
    id: number;
    login: string;
    pass: string;
    nombre: string;
    perfil: string;
    activo: number;
}

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const login = typeof body?.login === 'string' ? body.login.trim() : '';
        const password = typeof body?.password === 'string' ? body.password.trim() : '';

        if (!login || !password) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Usuario y contraseña son requeridos'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userTableCandidates = [
            'bdpersona.tbusuario',
            'tbusuario'
        ];

        let users: Usuario[] = [];
        let lastError: unknown = null;

        for (const userTable of userTableCandidates) {
            const sql = `
                SELECT id, login, pass, nombre, perfil, activo
                FROM ${userTable}
                WHERE UPPER(TRIM(login)) = UPPER(TRIM(?))
                  AND TRIM(pass) = TRIM(?)
                  AND activo != 0
                LIMIT 1
            `;

            try {
                users = await query<Usuario>(sql, [login, password]);

                if (users.length > 0) {
                    break;
                }
            } catch (error) {
                lastError = error;
            }
        }

        if (users.length === 0 && lastError) {
            throw lastError;
        }

        if (users.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const user = users[0];

        // Set session cookie with user info (JSON encoded)
        const sessionData = {
            id: user.id,
            login: user.login,
            nombre: user.nombre,
            perfil: user.perfil.trim().toUpperCase()
        };

        cookies.set('session', JSON.stringify(sessionData), {
            path: '/',
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 60 * 60 * 8 // 8 hours
        });

        return new Response(JSON.stringify({
            success: true,
            user: {
                nombre: user.nombre,
                perfil: user.perfil
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Login error:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';
        const lowerMessage = message.toLowerCase();
        const isEnvError = lowerMessage.includes('missing required environment variable');
        const isDbConnectionError = lowerMessage.includes('connect') || lowerMessage.includes('access denied') || lowerMessage.includes('unknown database');
        const isDbTimeoutError = lowerMessage.includes('timed out');

        return new Response(JSON.stringify({
            success: false,
            error: isEnvError
                ? 'Faltan variables de base de datos en el servidor'
                : isDbConnectionError
                    ? 'No se pudo conectar a la base de datos'
                    : isDbTimeoutError
                        ? 'La base de datos tardó demasiado en responder'
                    : 'Error al iniciar sesión',
            details: message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
