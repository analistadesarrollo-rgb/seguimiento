import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const STORAGE_FILE = path.join(process.cwd(), "storage", "permisos_visualizacion_visitas.json");
const normalizePerfil = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toUpperCase();
};
const normalizeMap = (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const normalized = {};
  for (const [origin, viewers] of Object.entries(raw)) {
    const normalizedOrigin = normalizePerfil(origin);
    if (!normalizedOrigin || !Array.isArray(viewers)) {
      continue;
    }
    const normalizedViewers = Array.from(new Set(
      viewers.map(normalizePerfil).filter(Boolean)
    )).sort();
    normalized[normalizedOrigin] = normalizedViewers;
  }
  return normalized;
};
const readVisitPermissionsMap = async () => {
  try {
    const content = await readFile(STORAGE_FILE, "utf-8");
    return normalizeMap(JSON.parse(content));
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
};
const writeVisitPermissionsMap = async (map) => {
  const normalized = normalizeMap(map);
  await mkdir(path.dirname(STORAGE_FILE), { recursive: true });
  await writeFile(STORAGE_FILE, JSON.stringify(normalized, null, 2), "utf-8");
};
const getAllowedOriginProfilesForViewer = async (viewerPerfil) => {
  const normalizedViewer = normalizePerfil(viewerPerfil);
  if (!normalizedViewer) {
    return [];
  }
  const map = await readVisitPermissionsMap();
  const allowedOriginsSet = /* @__PURE__ */ new Set();
  for (const [origin, viewers] of Object.entries(map)) {
    if (Array.isArray(viewers) && viewers.includes(normalizedViewer)) {
      allowedOriginsSet.add(normalizePerfil(origin));
    }
  }
  const maybeOrigins = map[normalizedViewer];
  if (Array.isArray(maybeOrigins)) {
    for (const o of maybeOrigins) {
      const no = normalizePerfil(o);
      if (no) allowedOriginsSet.add(no);
    }
  }
  return Array.from(allowedOriginsSet).sort();
};
const flattenPermissions = (map) => {
  return Object.entries(map).flatMap(([origin, viewers]) => viewers.map((viewer) => ({
    perfil_origen: origin,
    perfil_visualizador: viewer
  }))).sort((a, b) => {
    if (a.perfil_origen === b.perfil_origen) {
      return a.perfil_visualizador.localeCompare(b.perfil_visualizador);
    }
    return a.perfil_origen.localeCompare(b.perfil_origen);
  });
};

export { flattenPermissions as f, getAllowedOriginProfilesForViewer as g, normalizePerfil as n, readVisitPermissionsMap as r, writeVisitPermissionsMap as w };
