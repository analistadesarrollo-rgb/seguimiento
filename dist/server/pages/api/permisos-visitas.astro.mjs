import { q as query } from '../../chunks/db_D5YtOHEy.mjs';
import { n as normalizePerfil, r as readVisitPermissionsMap, f as flattenPermissions, w as writeVisitPermissionsMap } from '../../chunks/visitPermissions_BFAB2cjP.mjs';
export { renderers } from '../../renderers.mjs';

const ADMIN_PROFILE = "APLICACIONES";
const getSession = (cookies) => {
  const sessionCookie = cookies.get("session");
  if (!sessionCookie) {
    return null;
  }
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
};
const denyAccess = (status, message) => new Response(JSON.stringify({
  success: false,
  message
}), {
  status,
  headers: { "Content-Type": "application/json" }
});
const GET = async ({ cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return denyAccess(401, "Debes iniciar sesión nuevamente");
  }
  if (normalizePerfil(session.perfil) !== ADMIN_PROFILE) {
    return denyAccess(403, "Solo APLICACIONES puede administrar estos permisos");
  }
  try {
    const [profileRows, permissionMap] = await Promise.all([
      query(`
                SELECT DISTINCT UPPER(TRIM(perfil)) AS perfil
                FROM bdpersona.tbusuario
                WHERE perfil IS NOT NULL
                  AND TRIM(perfil) != ''
                ORDER BY perfil ASC
            `),
      readVisitPermissionsMap()
    ]);
    const permissionRows = flattenPermissions(permissionMap);
    const profileSet = /* @__PURE__ */ new Set([ADMIN_PROFILE]);
    profileRows.forEach((row) => {
      const normalized = normalizePerfil(row.perfil);
      if (normalized) {
        profileSet.add(normalized);
      }
    });
    permissionRows.forEach((row) => {
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
      permissions: permissionRows.map((row) => ({
        perfil_origen: normalizePerfil(row.perfil_origen),
        perfil_visualizador: normalizePerfil(row.perfil_visualizador)
      }))
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error loading visit permissions:", error);
    return denyAccess(500, error instanceof Error ? error.message : "Error al consultar permisos");
  }
};
const POST = async ({ request, cookies }) => {
  const session = getSession(cookies);
  if (!session) {
    return denyAccess(401, "Debes iniciar sesión nuevamente");
  }
  if (normalizePerfil(session.perfil) !== ADMIN_PROFILE) {
    return denyAccess(403, "Solo APLICACIONES puede administrar estos permisos");
  }
  try {
    const body = await request.json();
    const perfilOrigen = normalizePerfil(body?.perfilOrigen);
    const perfilesPermitidos = Array.isArray(body?.perfilesPermitidos) ? body.perfilesPermitidos.map(normalizePerfil).filter(Boolean) : [];
    if (!perfilOrigen) {
      return denyAccess(400, "Debes seleccionar un perfil origen");
    }
    const perfilesUnicos = Array.from(new Set(
      perfilesPermitidos.filter(Boolean)
    )).sort();
    const map = await readVisitPermissionsMap();
    map[perfilOrigen] = perfilesUnicos;
    await writeVisitPermissionsMap(map);
    return new Response(JSON.stringify({
      success: true,
      message: "Permisos guardados correctamente",
      perfilOrigen,
      perfilesPermitidos: perfilesUnicos
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error saving visit permissions:", error);
    return denyAccess(500, error instanceof Error ? error.message : "Error al guardar permisos");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
