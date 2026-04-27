import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type VisitPermissionsMap = Record<string, string[]>;

const STORAGE_FILE = path.join(process.cwd(), 'storage', 'permisos_visualizacion_visitas.json');

export const normalizePerfil = (value: unknown) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().toUpperCase();
};

const normalizeMap = (raw: unknown): VisitPermissionsMap => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return {};
    }

    const normalized: VisitPermissionsMap = {};

    for (const [origin, viewers] of Object.entries(raw as Record<string, unknown>)) {
        const normalizedOrigin = normalizePerfil(origin);

        if (!normalizedOrigin || !Array.isArray(viewers)) {
            continue;
        }

        const normalizedViewers = Array.from(new Set(
            viewers
                .map(normalizePerfil)
                .filter(Boolean)
        )).sort();

        normalized[normalizedOrigin] = normalizedViewers;
    }

    return normalized;
};

export const readVisitPermissionsMap = async (): Promise<VisitPermissionsMap> => {
    try {
        const content = await readFile(STORAGE_FILE, 'utf-8');
        return normalizeMap(JSON.parse(content));
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return {};
        }

        throw error;
    }
};

export const writeVisitPermissionsMap = async (map: VisitPermissionsMap) => {
    const normalized = normalizeMap(map);
    await mkdir(path.dirname(STORAGE_FILE), { recursive: true });
    await writeFile(STORAGE_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
};

export const getAllowedOriginProfilesForViewer = async (viewerPerfil: string) => {
    const normalizedViewer = normalizePerfil(viewerPerfil);

    if (!normalizedViewer) {
        return [];
    }

    const map = await readVisitPermissionsMap();
    const allowedOriginsSet = new Set<string>();

    // Case A: map keys are origin profiles and values are arrays of viewer profiles.
    for (const [origin, viewers] of Object.entries(map)) {
        if (Array.isArray(viewers) && viewers.includes(normalizedViewer)) {
            allowedOriginsSet.add(normalizePerfil(origin));
        }
    }

    // Case B: map key might be the viewer profile with values being origin profiles
    // (this handles configurations where the UI or user saved the mapping in reverse).
    const maybeOrigins = map[normalizedViewer];
    if (Array.isArray(maybeOrigins)) {
        for (const o of maybeOrigins) {
            const no = normalizePerfil(o);
            if (no) allowedOriginsSet.add(no);
        }
    }

    return Array.from(allowedOriginsSet).sort();
};

export const flattenPermissions = (map: VisitPermissionsMap) => {
    return Object.entries(map)
        .flatMap(([origin, viewers]) => viewers.map(viewer => ({
            perfil_origen: origin,
            perfil_visualizador: viewer
        })))
        .sort((a, b) => {
            if (a.perfil_origen === b.perfil_origen) {
                return a.perfil_visualizador.localeCompare(b.perfil_visualizador);
            }

            return a.perfil_origen.localeCompare(b.perfil_origen);
        });
};
