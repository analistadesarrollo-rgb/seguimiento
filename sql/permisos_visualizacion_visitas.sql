CREATE TABLE IF NOT EXISTS permisos_visualizacion_visitas (
    id INT NOT NULL AUTO_INCREMENT,
    perfil_origen VARCHAR(100) NOT NULL,
    perfil_visualizador VARCHAR(100) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_perfil_visualizacion (perfil_origen, perfil_visualizador),
    KEY idx_perfil_origen (perfil_origen),
    KEY idx_perfil_visualizador (perfil_visualizador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;