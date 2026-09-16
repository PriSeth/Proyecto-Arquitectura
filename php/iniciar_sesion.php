<?php

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
}

$usuario = trim($_POST['usuario'] ?? '');
$contrasena = $_POST['contrasena'] ?? '';

if ($usuario === '' || $contrasena === '') {
    responderJson(['ok' => false, 'mensaje' => 'Usuario y contraseña son obligatorios.'], 400);
}

$consulta = $conexion->prepare(
    'SELECT id_usuario, nombre, usuario, contrasena, rol
     FROM usuarios
    WHERE usuario = ?
     LIMIT 1'
);
$consulta->bind_param('s', $usuario);
$consulta->execute();
$resultado = $consulta->get_result();
$datosUsuario = $resultado->fetch_assoc();

if (!$datosUsuario || !password_verify($contrasena, $datosUsuario['contrasena'])) {
    $consulta->close();
    $conexion->close();
    responderJson(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos.'], 401);
}

session_regenerate_id(true);
$_SESSION['usuario'] = [
    'id_usuario' => (int) $datosUsuario['id_usuario'],
    'nombre' => $datosUsuario['nombre'],
    'usuario' => $datosUsuario['usuario'],
    'rol' => $datosUsuario['rol']
];

$consulta->close();
$conexion->close();

responderJson([
    'ok' => true,
    'rol' => $datosUsuario['rol'],
    'redireccion' => 'inicio.html'
]);
