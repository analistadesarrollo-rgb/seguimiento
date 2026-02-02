<?php
/**
 * API de Visitas
 * Retorna visitas de Multired y/o Servired con filtros opcionales
 * 
 * Parámetros GET:
 * - empresa: 'multired' | 'servired' | 'ambas' (default: 'ambas')
 * - fecha_inicio: YYYY-MM-DD (opcional)
 * - fecha_fin: YYYY-MM-DD (opcional)
 * - supervisor: string (opcional)
 * - sucursal: string (opcional)
 */

require_once 'conexion.php';

header('Content-Type: application/json; charset=utf-8');

// Obtener parámetros de filtro
$empresa = isset($_GET['empresa']) ? strtolower($_GET['empresa']) : 'ambas';
$fecha_inicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : null;
$fecha_fin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : null;
$supervisor = isset($_GET['supervisor']) ? $_GET['supervisor'] : null;
$sucursal = isset($_GET['sucursal']) ? $_GET['sucursal'] : null;

// Función para construir la consulta con filtros
function buildQuery($tabla, $empresa_nombre, $params)
{
    $sql = "SELECT 
        ip,
        nombres AS punto_venta,
        documento,
        sucursal,
        supervisor,
        fechavisita AS fecha,
        horavisita AS hora,
        latitud,
        longitud,
        '$empresa_nombre' AS empresa
    FROM $tabla WHERE 1=1";

    $bindings = [];

    if (!empty($params['fecha_inicio'])) {
        $sql .= " AND fechavisita >= :fecha_inicio";
        $bindings[':fecha_inicio'] = $params['fecha_inicio'];
    }

    if (!empty($params['fecha_fin'])) {
        $sql .= " AND fechavisita <= :fecha_fin";
        $bindings[':fecha_fin'] = $params['fecha_fin'];
    }

    if (!empty($params['supervisor'])) {
        $sql .= " AND supervisor = :supervisor";
        $bindings[':supervisor'] = $params['supervisor'];
    }

    if (!empty($params['sucursal'])) {
        $sql .= " AND sucursal = :sucursal";
        $bindings[':sucursal'] = $params['sucursal'];
    }

    // Filtrar solo registros con coordenadas válidas
    $sql .= " AND latitud IS NOT NULL AND latitud != '' AND longitud IS NOT NULL AND longitud != ''";

    return ['sql' => $sql, 'bindings' => $bindings];
}

try {
    $visitas = [];
    $params = [
        'fecha_inicio' => $fecha_inicio,
        'fecha_fin' => $fecha_fin,
        'supervisor' => $supervisor,
        'sucursal' => $sucursal
    ];

    // Consultar según empresa seleccionada
    if ($empresa === 'multired' || $empresa === 'ambas') {
        $query = buildQuery('registrovisitas', 'Multired', $params);
        $stmt = $pdo->prepare($query['sql']);
        $stmt->execute($query['bindings']);
        $visitas = array_merge($visitas, $stmt->fetchAll());
    }

    if ($empresa === 'servired' || $empresa === 'ambas') {
        $query = buildQuery('registrovisitasservired', 'Servired', $params);
        $stmt = $pdo->prepare($query['sql']);
        $stmt->execute($query['bindings']);
        $visitas = array_merge($visitas, $stmt->fetchAll());
    }

    // Ordenar por fecha y hora descendente
    usort($visitas, function ($a, $b) {
        $dateA = $a['fecha'] . ' ' . $a['hora'];
        $dateB = $b['fecha'] . ' ' . $b['hora'];
        return strcmp($dateB, $dateA);
    });

    echo json_encode([
        'success' => true,
        'total' => count($visitas),
        'data' => $visitas
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al consultar visitas'
    ]);
}
