<?php

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método no permitido.');
}

$sesion = usuarioActual();

if (!$sesion) {
    header('Location: ../index.html');
    exit;
}

$nombre = $sesion['usuario'];
$calificacion = filter_input(INPUT_POST, 'calificacion', FILTER_VALIDATE_INT);
$comentario = trim($_POST['comentario'] ?? '');

// El correo se obtiene de la cuenta del usuario.
$idUsuario = (int) $sesion['id_usuario'];
$consultaCorreo = $conexion->prepare('SELECT correo FROM usuarios WHERE id_usuario = ? LIMIT 1');

if (!$consultaCorreo) {
    http_response_code(500);
    exit('No se pudo obtener los datos del usuario.');
}

$consultaCorreo->bind_param('i', $idUsuario);
$consultaCorreo->execute();
$filaUsuario = $consultaCorreo->get_result()->fetch_assoc();
$consultaCorreo->close();

$correo = $filaUsuario['correo'] ?? '';

if ($nombre === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)
    || $calificacion === false || $calificacion === null || $calificacion < 1 || $calificacion > 5
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