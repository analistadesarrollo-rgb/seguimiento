import type { APIRoute } from 'astro';
import { query } from '../../lib/db';

interface Visita {
    ip: string;
    punto_venta: string;
    documento: string;
    sucursal: string;
    supervisor: string;
    fecha: string;
    hora: string;
    latitud: string;
    longitud: string;
    empresa: string;
}

// Profile-based access rules
const PROFILE_RULES: Record<string, { tables: string[], perfilFilter?: string, excludePerfilFilter?: string }> = {
    // Servired commercial - sees Servired visits where supervisor is NOT AUDITORIA-OPERATIVA
    'COMERCIAL-SERVIRED': { tables: ['registrovisitasservired'], excludePerfilFilter: 'AUDITORIA-OPERATIVA' },
    'APLICACIONES': { tables: ['registrovisitasservired'], excludePerfilFilter: 'AUDITORIA-OPERATIVA' },

    // Servired audit - sees only Servired visits where supervisor IS AUDITORIA-OPERATIVA
    'AUDITORIA-SERVIRED': { tables: ['registrovisitasservired'], perfilFilter: 'AUDITORIA-OPERATIVA' },

    // Multired commercial - sees Multired visits where supervisor is NOT AUDITORIA-OPERATIVA
    'COMERCIAL-MULTIRED': { tables: ['registrovisitas'], excludePerfilFilter: 'AUDITORIA-OPERATIVA' },

    // Multired audit - sees only Multired visits where supervisor IS AUDITORIA-OPERATIVA
    'AUDITORIA-MULTIRED': { tables: ['registrovisitas'], perfilFilter: 'AUDITORIA-OPERATIVA' },

    // Operative audit - sees both tables where supervisor IS AUDITORIA-OPERATIVA
    'AUDITORIA-OPERATIVA': { tables: ['registrovisitas', 'registrovisitasservired'], perfilFilter: 'AUDITORIA-OPERATIVA' },

    // Admin profiles - see everything
    'ADMINISTRADOR': { tables: ['registrovisitas', 'registrovisitasservired'] },
    'ADMIN': { tables: ['registrovisitas', 'registrovisitasservired'] },
    'GERENCIA': { tables: ['registrovisitas', 'registrovisitasservired'] },
    'TECNOLOGIA': { tables: ['registrovisitas', 'registrovisitasservired'] },

    // Administration profiles
    'ADMINISTRACION_MULTIRED': { tables: ['registrovisitas'] },
    'ADMINISTRACION_SERVIRED': { tables: ['registrovisitasservired'] },
    'ADMINISTRACION': { tables: ['registrovisitas', 'registrovisitasservired'] },

    // Coordinators - see both
    'COORDINADOR': { tables: ['registrovisitas', 'registrovisitasservired'] },
    'COORDINADOR COMERCIAL': { tables: ['registrovisitas', 'registrovisitasservired'] },

    // Supervisors - see their own visits (by login)
    'SUPERVISOR': { tables: ['registrovisitas', 'registrovisitasservired'] },
};

export const GET: APIRoute = async ({ url }) => {
    try {
        const empresa = url.searchParams.get('empresa') || 'ambas';
        const fecha_inicio = url.searchParams.get('fecha_inicio');
        const fecha_fin = url.searchParams.get('fecha_fin');
        const supervisor = url.searchParams.get('supervisor');
        const perfil = url.searchParams.get('perfil')?.toUpperCase() || '';
        const userLogin = url.searchParams.get('user_login') || '';

        let visitas: Visita[] = [];

        // Get profile rules (default to both tables if profile not defined)
        const rules = PROFILE_RULES[perfil] || { tables: ['registrovisitas', 'registrovisitasservired'] };

        // Build query function
        const buildQuery = (tabla: string, empresaNombre: string) => {
            let sql = `
        SELECT 
          s.ip,
          s.nombres AS punto_venta,
          s.documento,
          COALESCE(p.NOMBRE, s.sucursal) AS sucursal,
          COALESCE(b.nombre, s.supervisor) AS supervisor,
          DATE_FORMAT(s.fechavisita, '%Y-%m-%d') AS fecha,
          TIME_FORMAT(s.horavisita, '%H:%i:%s') AS hora,
          s.latitud,
          s.longitud,
          '${empresaNombre}' AS empresa
        FROM ${tabla} s
        LEFT JOIN GAMBLE.INFORMACION_PUNTOSVENTA p ON s.sucursal = p.codigo
        LEFT JOIN bdpersona.tbusuario b ON s.supervisor = b.login
        WHERE s.latitud IS NOT NULL 
          AND s.latitud != '' 
          AND s.longitud IS NOT NULL 
          AND s.longitud != ''
      `;

            const params: any[] = [];

            // Apply profile-based filters
            if (rules.perfilFilter) {
                sql += ' AND b.perfil = ?';
                params.push(rules.perfilFilter);
            }

            if (rules.excludePerfilFilter) {
                sql += ' AND (b.perfil IS NULL OR b.perfil != ?)';
                params.push(rules.excludePerfilFilter);
            }

            // Supervisor profile: only see own visits
            if (perfil === 'SUPERVISOR' && userLogin) {
                sql += ' AND s.supervisor = ?';
                params.push(userLogin);
            }

            if (fecha_inicio) {
                sql += ' AND s.fechavisita >= ?';
                params.push(fecha_inicio);
            }

            if (fecha_fin) {
                sql += ' AND s.fechavisita <= ?';
                params.push(fecha_fin);
            }

            if (supervisor) {
                sql += ' AND (s.supervisor = ? OR b.nombre LIKE ?)';
                params.push(supervisor);
                params.push(`%${supervisor}%`);
            }

            return { sql, params };
        };

        // Determine which tables to query based on profile and empresa filter
        const tablesToQuery: { tabla: string; nombre: string }[] = [];

        if (rules.tables.includes('registrovisitas') && (empresa === 'multired' || empresa === 'ambas')) {
            tablesToQuery.push({ tabla: 'registrovisitas', nombre: 'Multired' });
        }

        if (rules.tables.includes('registrovisitasservired') && (empresa === 'servired' || empresa === 'ambas')) {
            tablesToQuery.push({ tabla: 'registrovisitasservired', nombre: 'Servired' });
        }

        // Execute queries
        for (const { tabla, nombre } of tablesToQuery) {
            const { sql, params } = buildQuery(tabla, nombre);
            const results = await query<Visita>(sql, params);
            visitas = [...visitas, ...results];
        }

        // Sort by date and time descending
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
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Error fetching visitas:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error al consultar visitas',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
