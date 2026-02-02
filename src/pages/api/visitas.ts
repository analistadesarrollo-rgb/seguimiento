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

export const GET: APIRoute = async ({ url }) => {
    try {
        const empresa = url.searchParams.get('empresa') || 'ambas';
        const fecha_inicio = url.searchParams.get('fecha_inicio');
        const fecha_fin = url.searchParams.get('fecha_fin');
        const supervisor = url.searchParams.get('supervisor');

        let visitas: Visita[] = [];

        // Build query function
        const buildQuery = (tabla: string, empresaNombre: string) => {
            let sql = `
        SELECT 
          s.ip,
          s.nombres AS punto_venta,
          s.documento,
          p.NOMBRE AS sucursal,
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

        // Query based on empresa filter
        if (empresa === 'multired' || empresa === 'ambas') {
            const { sql, params } = buildQuery('registrovisitas', 'Multired');
            const results = await query<Visita>(sql, params);
            visitas = [...visitas, ...results];
        }

        if (empresa === 'servired' || empresa === 'ambas') {
            const { sql, params } = buildQuery('registrovisitasservired', 'Servired');
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
