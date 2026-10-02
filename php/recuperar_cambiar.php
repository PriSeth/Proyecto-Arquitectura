<?php
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
}

$codigo     = trim($_POST['codigo'] ?? '');
$contrasena = $_POST['contrasena'] ?? '';
$confirmar  = $_POST['confirmar'] ?? '';
$v          = $_SESSION['recuperacion'] ?? null;

if (!$v || time() > $v['expira']) {
    unset($_SESSION['recuperacion']);
    responderJson(['ok' => false, 'mensaje' => 'El código venció. Pide uno nuevo.'], 400);
}
if ($v['intentos'] >= 5) {
    unset($_SESSION['recuperacion']);
    responderJson(['ok' => false, 'mensaje' => 'Demasiados intentos. Pide un código nuevo.'], 429);
}

// Misma regla que en el registro: 4 a 8 caracteres, sin espacios
if (!preg_match('/^\S{4,8}$/', $contrasena)) {
    responderJson(['ok' => false, 'mensaje' => 'La contraseña debe tener entre 4 y 8 caracteres, sin espacios.'], 400);
}
if ($contrasena !== $confirmar) {
    responderJson(['ok' => false, 'mensaje' => 'Las contraseñas no coinciden.'], 400);
}

$_SESSION['recuperacion']['intentos']++;

if (!hash_equals($v['codigo'], $codigo)) {
    responderJson(['ok' => false, 'mensaje' => 'Código incorrecto.'], 400);
}

$hash = password_hash($contrasena, PASSWORD_DEFAULT);
$consulta = $conexion->prepare('UPDATE usuarios SET contrasena = ? WHERE correo = ?');

if (!$consulta) {
    responderJson(['ok' => false, 'mensaje' => 'No se pudo actualizar la contraseña.'], 500);
}

$consulta->bind_param('ss', $hash, $v['correo']);

try {
    $consulta->execute();
} catch (mysqli_sql_exception $e) {
    error_log('recuperar_cambiar: ' . $e->getMessage());
    responderJson(['ok' => false, 'mensaje' => 'No se pudo actualizar la contraseña.'], 500);
}

$consulta->close();
$conexion->close();

unset($_SESSION['recuperacion']);

responderJson(['ok' => true, 'mensaje' => 'Contraseña actualizada. Ya puedes iniciar sesión.']);
