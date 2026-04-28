<?php
/**
 * Conexión a la base de datos MySQL usando PDO
 * Base de datos: appseguimiento
 */

function get_env_value(string $key): ?string {
    $value = getenv($key);

    if ($value !== false && $value !== '') {
        return $value;
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }

    $envPath = __DIR__ . '/../.env';
    if (is_readable($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            $trimmedLine = trim($line);

            if ($trimmedLine === '' || str_starts_with($trimmedLine, '#') || strpos($trimmedLine, '=') === false) {
                continue;
            }

            [$envKey, $envValue] = array_map('trim', explode('=', $trimmedLine, 2));

            if ($envKey === $key && $envValue !== '') {
                return trim($envValue, "\"'");
            }
        }
    }

    return null;
}

$DB_HOST = get_env_value('DB_HOST');
$DB_USER = get_env_value('DB_USER');
$DB_PASS = get_env_value('DB_PASS');
$DB_NAME = get_env_value('DB_NAME');

if (!$DB_HOST || !$DB_USER || !$DB_NAME) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Faltan variables de entorno para la base de datos']);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

// Headers CORS para permitir peticiones desde el frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
