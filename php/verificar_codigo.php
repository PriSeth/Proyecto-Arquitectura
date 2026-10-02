<?php
require_once __DIR__ . '/sesion.php';

$codigo = trim($_POST['codigo'] ?? '');
$v = $_SESSION['verificacion'] ?? null;

if (!$v || time() > $v['expira']) {
    responderJson(['ok' => false, 'mensaje' => 'El código venció. Pide uno nuevo.'], 400);
}
if ($v['intentos'] >= 5) {
    responderJson(['ok' => false, 'mensaje' => 'Demasiados intentos. Pide un código nuevo.'], 429);
}

$_SESSION['verificacion']['intentos']++;

if (!hash_equals($v['codigo'], $codigo)) {
    responderJson(['ok' => false, 'mensaje' => 'Código incorrecto.'], 400);
}

$_SESSION['correo_verificado'] = $v['correo'];
unset($_SESSION['verificacion']);

responderJson(['ok' => true, 'mensaje' => 'Correo verificado.']);