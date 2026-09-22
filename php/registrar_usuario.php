<?php

require_once __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método no permitido.');
}

$nombre = trim($_POST['nombre'] ?? '');
$rut = trim($_POST['rut'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$usuario = trim($_POST['usuario'] ?? '');
$contrasena = $_POST['contraseña'] ?? '';
$telefono = trim($_POST['telefono'] ?? '');

if ($nombre === '' || $rut === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)
    || !preg_match('/^[A-Za-z0-9_]{3,10}$/', $usuario)
    || !preg_match('/^\S{4,8}$/', $contrasena)
    || !preg_match('/^9[0-9]{8}$/', $telefono)) {
    http_response_code(400);
    exit('Revisa los datos ingresados.');
}

$hash = password_hash($contrasena, PASSWORD_DEFAULT);
$consulta = $conexion->prepare(
    'INSERT INTO usuarios (nombre, rut, correo, usuario, contrasena, telefono)
     VALUES (?, ?, ?, ?, ?, ?)'
);

if (!$consulta) {
    http_response_code(500);
    exit('No se pudo preparar el registro.');
}

$consulta->bind_param('ssssss', $nombre, $rut, $correo, $usuario, $hash, $telefono);

try {
    $consulta->execute();
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() === 1062) {
        http_response_code(409);
        exit('El RUT, correo o usuario ya está registrado.');
    }
    http_response_code(500);
    exit('No se pudo guardar el usuario.');
}

$consulta->close();
$conexion->close();

header('Location: ../index.html?registro=exitoso');
exit;
