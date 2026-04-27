import type { APIRoute } from 'astro';
import { query } from '../../lib/db';
import {
    flattenPermissions,
    normalizePerfil,
    readVisitPermissionsMap,
    writeVisitPermissionsMap
} from '../../lib/visitPermissions';

interface SessionData {
    id: number;
    login: string;
    nombre: string;
    perfil: string;
}

interface ProfileRow {
    perfil: string;
}

const ADMIN_PROFILE = 'APLICACIONES';

const getSession = (cookies: Parameters<APIRoute>[0]['cookies']) => {
    const sessionCookie = cookies.get('session');

    if (!sessionCookie) {
        return null;
    }

    try {
        return JSON.parse(sessionCookie.value) as SessionData;
    } catch {
        return null;
    }
};

const denyAccess = (status: number, message: string) => new Response(JSON.stringify({
    success: false,
    message
}), {
    status,
    headers: { 'Content-Type': 'application/json' }
});

export const GET: APIRoute = async ({ cookies }) => {
    const session = getSession(cookies);

    if (!session) {
        return denyAccess(401, 'Debes iniciar sesión nuevamente');
    }

    if (normalizePerfil(session.perfil) !== ADMIN_PROFILE) {
        return denyAccess(403, 'Solo APLICACIONES puede administrar estos permisos');
    }

    try {
        const [profileRows, permissionMap] = await Promise.all([
            query<ProfileRow>(`
                SELECT DISTINCT UPPER(TRIM(perfil)) AS perfil
                FROM bdpersona.tbusuario
                WHERE perfil IS NOT NULL
                  AND TRIM(perfil) != ''
                ORDER BY perfil ASC
            `),
            readVisitPermissionsMap()
        ]);
        const permissionRows = flattenPermissions(permissionMap);

        const profileSet = new Set<string>([ADMIN_PROFILE]);

        profileRows.forEach(row => {
            const normalized = normalizePerfil(row.perfil);
            if (normalized) {
                profileSet.add(normalized);
            }
        });

        permissionRows.forEach(row => {
            const origin = normalizePerfil(row.perfil_origen);
            const viewer = normalizePerfil(row.perfil_visualizador);

            if (origin) {
                profileSet.add(origin);
            }

            if (viewer) {
                profileSet.add(viewer);
            }
        });

        return new Response(JSON.stringify({
            success: true,
            profiles: Array.from(profileSet).sort(),
            permissions: permissionRows.map(row => ({
                perfil_origen: normalizePerfil(row.perfil_origen),
                perfil_visualizador: normalizePerfil(row.perfil_visualizador)
            }))
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error loading visit permissions:', error);
        return denyAccess(500, error instanceof Error ? error.message : 'Error al consultar permisos');
    }
};

export const POST: APIRoute = async ({ request, cookies }) => {
    const session = getSession(cookies);

    if (!session) {
        return denyAccess(401, 'Debes iniciar sesión nuevamente');
    }

    if (normalizePerfil(session.perfil) !== ADMIN_PROFILE) {
        return denyAccess(403, 'Solo APLICACIONES puede administrar estos permisos');
    }

    try {
        const body = await request.json();
        const perfilOrigen = normalizePerfil(body?.perfilOrigen);
        const perfilesPermitidos = Array.isArray(body?.perfilesPermitidos)
            ? body.perfilesPermitidos.map(normalizePerfil).filter(Boolean)
            : [];

        if (!perfilOrigen) {
            return denyAccess(400, 'Debes seleccionar un perfil origen');
        }

        const perfilesUnicos = Array.from(new Set(
            perfilesPermitidos.filter(Boolean)
        )).sort();

        const map = await readVisitPermissionsMap();
        map[perfilOrigen] = perfilesUnicos;
        await writeVisitPermissionsMap(map);

        return new Response(JSON.stringify({
            success: true,
            message: 'Permisos guardados correctamente',
            perfilOrigen,
            perfilesPermitidos: perfilesUnicos
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error saving visit permissions:', error);
        return denyAccess(500, error instanceof Error ? error.message : 'Error al guardar permisos');
    }
};