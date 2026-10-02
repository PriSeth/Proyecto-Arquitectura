<?php

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

exigirSesion();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
}

$resumen = $conexion->query(
    'SELECT COUNT(*) AS total, COALESCE(AVG(LEAST(calificacion, 5)), 0) AS promedio
     FROM opiniones
     WHERE calificacion BETWEEN 1 AND 6'
)->fetch_assoc();

$calificaciones = array_fill(0, 5, 0);
$consultaCalificaciones = $conexion->query(
    'SELECT LEAST(calificacion, 5) AS calificacion, COUNT(*) AS cantidad
     FROM opiniones
     WHERE calificacion BETWEEN 1 AND 6
     GROUP BY LEAST(calificacion, 5)'
);

while ($fila = $consultaCalificaciones->fetch_assoc()) {
    $indice = (int) $fila['calificacion'] - 1;
    $calificaciones[$indice] = (int) $fila['cantidad'];
}

$opiniones = $conexion->query(
    'SELECT nombre, LEAST(calificacion, 5) AS calificacion, comentario
     FROM opiniones
     WHERE calificacion BETWEEN 1 AND 6
     ORDER BY RAND()
     LIMIT 6'
)->fetch_all(MYSQLI_ASSOC);

$conexion->close();

responderJson([
    'ok' => true,
    'total' => (int) $resumen['total'],
    'promedio' => (float) $resumen['promedio'],
    'calificaciones' => $calificaciones,
    'opiniones' => $opiniones
]);