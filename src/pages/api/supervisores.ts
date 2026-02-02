import type { APIRoute } from 'astro';
import { query } from '../../lib/db';

interface SupervisorRow {
    supervisor: string;
}

export const GET: APIRoute = async () => {
    try {
        const sql = `
      SELECT DISTINCT supervisor 
      FROM (
        SELECT supervisor FROM registrovisitas 
        WHERE supervisor IS NOT NULL AND supervisor != ''
        UNION
        SELECT supervisor FROM registrovisitasservired 
        WHERE supervisor IS NOT NULL AND supervisor != ''
      ) AS all_supervisors
      ORDER BY supervisor ASC
    `;

        const results = await query<SupervisorRow>(sql);
        const supervisores = results.map(row => row.supervisor);

        return new Response(JSON.stringify({
            success: true,
            total: supervisores.length,
            data: supervisores
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Error fetching supervisores:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error al consultar supervisores',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
