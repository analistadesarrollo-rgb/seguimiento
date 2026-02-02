import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
    cookies.delete('session', { path: '/' });

    return new Response(JSON.stringify({
        success: true,
        message: 'Sesión cerrada correctamente'
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
