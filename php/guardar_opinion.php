<?php

require_once __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método no permitido.');
}

$nombre = trim($_POST['nombre'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$calificacion = filter_input(INPUT_POST, 'calificacion', FILTER_VALIDATE_INT);
$comentario = trim($_POST['comentario'] ?? '');

if ($nombre === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)
    || $calificacion === false || $calificacion < 1 || $calificacion > 5
    || $comentario === '') {
    http_response_code(400);
    exit('Revisa los datos de la opinión.');
}

$consulta = $conexion->prepare(
    'INSERT INTO opiniones (nombre, correo, calificacion, comentario)
     VALUES (?, ?, ?, ?)'
);

if (!$consulta) {
    http_response_code(500);
    exit('No se pudo preparar el registro de la opinión.');
}

$consulta->bind_param('ssis', $nombre, $correo, $calificacion, $comentario);

if (!$consulta->execute()) {
    http_response_code(500);
    exit('No se pudo guardar la opinión.');
}

$consulta->close();
$conexion->close();

header('Location: ../opinion.html?opinion=guardada');
exit;
