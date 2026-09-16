<?php

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

exigirSesion();

$fecha = $_GET['fecha'] ?? date('Y-m-d');
$fechaValida = DateTime::createFromFormat('Y-m-d', $fecha);

if (!$fechaValida || $fechaValida->format('Y-m-d') !== $fecha) {
    responderJson(['ok' => false, 'mensaje' => 'La fecha no es válida.'], 400);
}

$consulta = $conexion->prepare(
    "SELECT c.id_clase, c.nombre_clase, c.horario, c.cupos, c.estado,
            COUNT(r.id_reserva) AS reservas_realizadas,
            c.cupos - COUNT(r.id_reserva) AS cupos_disponibles
     FROM clases c
     LEFT JOIN reservas r
       ON r.id_clase = c.id_clase
      AND r.fecha = ?
      AND r.estado IN ('Pendiente', 'Confirmada')
     GROUP BY c.id_clase, c.nombre_clase, c.horario, c.cupos, c.estado
     ORDER BY c.horario"
);
$consulta->bind_param('s', $fecha);
$consulta->execute();
$resultado = $consulta->get_result();
$clases = $resultado->fetch_all(MYSQLI_ASSOC);

$consulta->close();
$conexion->close();

responderJson(['ok' => true, 'clases' => $clases]);
