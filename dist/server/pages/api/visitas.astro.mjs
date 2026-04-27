import { q as query } from '../../chunks/db_D5YtOHEy.mjs';
import { g as getAllowedOriginProfilesForViewer } from '../../chunks/visitPermissions_BFAB2cjP.mjs';
export { renderers } from '../../renderers.mjs';

const PROFILE_RULES = {
  // Servired commercial - sees Servired visits where supervisor is NOT AUDITORIA-OPERATIVA
  "COMERCIAL-SERVIRED": { tables: ["registrovisitasservired"], excludePerfilFilter: "AUDITORIA-OPERATIVA" },
  "APLICACIONES": { tables: ["registrovisitasservired"], excludePerfilFilter: "AUDITORIA-OPERATIVA" },
  // Servired audit - sees Servired AND Multired visits where supervisor IS AUDITORIA-OPERATIVA
  "AUDITORIA-SERVIRED": { tables: ["registrovisitasservired", "registrovisitas"], perfilFilter: "AUDITORIA-OPERATIVA" },
  // Multired commercial - sees Multired visits where supervisor is NOT AUDITORIA-OPERATIVA
  "COMERCIAL-MULTIRED": { tables: ["registrovisitas"], excludePerfilFilter: "AUDITORIA-OPERATIVA" },
  // Multired audit - sees only Multired visits where supervisor IS AUDITORIA-OPERATIVA
  "AUDITORIA-MULTIRED": { tables: ["registrovisitas"], perfilFilter: "AUDITORIA-OPERATIVA" },
  // Operative audit - sees both tables where supervisor IS AUDITORIA-OPERATIVA
  "AUDITORIA-OPERATIVA": { tables: ["registrovisitas", "registrovisitasservired"], perfilFilter: "AUDITORIA-OPERATIVA" },
  // Admin profiles - see everything
  "ADMINISTRADOR": { tables: ["registrovisitas", "registrovisitasservired"] },
  "ADMIN": { tables: ["registrovisitas", "registrovisitasservired"] },
  "GERENCIA": { tables: ["registrovisitas", "registrovisitasservired"] },
  "TECNOLOGIA": { tables: ["registrovisitas", "registrovisitasservired"] },
  // Administration profiles
  "ADMINISTRACION_MULTIRED": { tables: ["registrovisitas"] },
  "ADMINISTRACION_SERVIRED": { tables: ["registrovisitasservired"] },
  "ADMINISTRACION": { tables: ["registrovisitas", "registrovisitasservired"] },
  // Coordinators - see both
  "COORDINADOR": { tables: ["registrovisitas", "registrovisitasservired"] },
  "COORDINADOR COMERCIAL": { tables: ["registrovisitas", "registrovisitasservired"] },
  // Supervisors - see their own visits (by login)
  "SUPERVISOR": { tables: ["registrovisitas", "registrovisitasservired"] }
};
const unrestrictedProfiles = /* @__PURE__ */ new Set([
  "ADMINISTRADOR",
  "ADMIN",
  "GERENCIA",
  "TECNOLOGIA",
  "ADMINISTRACION",
  "ADMINISTRACION_MULTIRED",
  "ADMINISTRACION_SERVIRED",
  "COORDINADOR",
  "COORDINADOR COMERCIAL",
  "SUPERVISOR",
  "APLICACIONES"
]);
const normalizePerfil = (value) => value.trim().toUpperCase();
const getAllowedOriginProfiles = async (viewerPerfil) => {
  if (unrestrictedProfiles.has(viewerPerfil)) {
    return [];
  }
  return getAllowedOriginProfilesForViewer(viewerPerfil);
};
const GET = async ({ url }) => {
  try {
    const empresa = url.searchParams.get("empresa") || "ambas";
    const fecha_inicio = url.searchParams.get("fecha_inicio");
    const fecha_fin = url.searchParams.get("fecha_fin");
    const supervisor = url.searchParams.get("supervisor");
    const perfil = normalizePerfil(url.searchParams.get("perfil") || "");
    const userLogin = url.searchParams.get("user_login") || "";
    let visitas = [];
    const allowedOriginProfiles = await getAllowedOriginProfiles(perfil);
    const hasDynamicRestriction = allowedOriginProfiles.length > 0;
    const startDate = fecha_inicio && fecha_inicio.trim() ? fecha_inicio.trim() : null;
    const endDate = fecha_fin && fecha_fin.trim() ? fecha_fin.trim() : null;
    const normalizedStartDate = startDate && endDate && startDate > endDate ? endDate : startDate;
    const normalizedEndDate = startDate && endDate && startDate > endDate ? startDate : endDate;
    const rules = PROFILE_RULES[perfil] || { tables: ["registrovisitas", "registrovisitasservired"] };
    const buildQuery = (tabla, empresaNombre) => {
      const profileExpr = "COALESCE(b.perfil, b2.perfil)";
      let sql = `
        SELECT 
          s.ip,
          s.nombres AS punto_venta,
          s.documento,
          COALESCE(p.NOMBRE, s.sucursal) AS sucursal,
          COALESCE(b.nombre, b2.nombre, s.supervisor) AS supervisor,
          ${profileExpr} AS perfil_supervisor,
          DATE_FORMAT(s.fechavisita, '%Y-%m-%d') AS fecha,
          TIME_FORMAT(s.horavisita, '%H:%i:%s') AS hora,
          s.latitud,
          s.longitud,
          '${empresaNombre}' AS empresa
        FROM ${tabla} s
        LEFT JOIN GAMBLE.INFORMACION_PUNTOSVENTA p ON s.sucursal = p.codigo
        LEFT JOIN bdpersona.tbusuario b ON s.supervisor = b.login
        LEFT JOIN bdpersona.tbusuario b2 ON CONCAT('CP', s.supervisor) = b2.login
        WHERE s.latitud IS NOT NULL 
          AND s.latitud != '' 
          AND s.longitud IS NOT NULL 
          AND s.longitud != ''
      `;
      const params = [];
      if (hasDynamicRestriction) {
        const placeholders = allowedOriginProfiles.map(() => "?").join(", ");
        sql += ` AND ${profileExpr} IN (${placeholders})`;
        params.push(...allowedOriginProfiles);
      } else {
        if (rules.perfilFilter) {
          sql += ` AND ${profileExpr} = ?`;
          params.push(rules.perfilFilter);
        }
        if (rules.excludePerfilFilter) {
          sql += ` AND (${profileExpr} IS NULL OR ${profileExpr} != ?)`;
          params.push(rules.excludePerfilFilter);
        }
      }
      if (perfil === "SUPERVISOR" && userLogin) {
        sql += " AND s.supervisor = ?";
        params.push(userLogin);
      }
      if (normalizedStartDate && normalizedEndDate) {
        sql += " AND DATE(s.fechavisita) BETWEEN ? AND ?";
        params.push(normalizedStartDate, normalizedEndDate);
      } else if (normalizedStartDate) {
        sql += " AND DATE(s.fechavisita) >= ?";
        params.push(normalizedStartDate);
      } else if (normalizedEndDate) {
        sql += " AND DATE(s.fechavisita) <= ?";
        params.push(normalizedEndDate);
      }
      if (supervisor) {
        sql += " AND (s.supervisor = ? OR b.nombre LIKE ?)";
        params.push(supervisor);
        params.push(`%${supervisor}%`);
      }
      return { sql, params };
    };
    const tablesToQuery = [];
    if (rules.tables.includes("registrovisitas") && (empresa === "multired" || empresa === "ambas")) {
      tablesToQuery.push({ tabla: "registrovisitas", nombre: "Multired" });
    }
    if (rules.tables.includes("registrovisitasservired") && (empresa === "servired" || empresa === "ambas")) {
      tablesToQuery.push({ tabla: "registrovisitasservired", nombre: "Servired" });
    }
    for (const { tabla, nombre } of tablesToQuery) {
      const { sql, params } = buildQuery(tabla, nombre);
      const results = await query(sql, params);
      visitas = [...visitas, ...results];
    }
    visitas.sort((a, b) => {
      const dateA = `${a.fecha} ${a.hora}`;
      const dateB = `${b.fecha} ${b.hora}`;
      return dateB.localeCompare(dateA);
    });
    return new Response(JSON.stringify({
      success: true,
      total: visitas.length,
      data: visitas
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching visitas:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Error al consultar visitas",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
