import type { APIRoute } from 'astro';

interface SessionData {
    id: number;
    login: string;
    nombre: string;
    perfil: string;
}

export const GET: APIRoute = async ({ cookies }) => {
    const sessionCookie = cookies.get('session');

    if (!sessionCookie) {
        return new Response(JSON.stringify({
            authenticated: false
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const session: SessionData = JSON.parse(sessionCookie.value);

        return new Response(JSON.stringify({
            authenticated: true,
            user: {
                id: session.id,
                login: session.login,
                nombre: session.nombre,
                perfil: session.perfil
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch {
        return new Response(JSON.stringify({
            authenticated: false
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
