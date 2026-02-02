<?php
/**
 * API de Supervisores
 * Retorna lista única de supervisores de ambas tablas
 */

require_once 'conexion.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Obtener supervisores únicos de ambas tablas
    $sql = "
        SELECT DISTINCT supervisor 
        FROM (
            SELECT supervisor FROM registrovisitas WHERE supervisor IS NOT NULL AND supervisor != ''
            UNION
            SELECT supervisor FROM registrovisitasservired WHERE supervisor IS NOT NULL AND supervisor != ''
        ) AS all_supervisors
        ORDER BY supervisor ASC
    ";

    $stmt = $pdo->query($sql);
    $supervisores = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'total' => count($supervisores),
        'data' => $supervisores
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al consultar supervisores'
    ]);
}
