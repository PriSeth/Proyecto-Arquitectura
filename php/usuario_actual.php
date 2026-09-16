<?php

require_once __DIR__ . '/sesion.php';

$usuario = usuarioActual();

if (!$usuario) {
    responderJson(['ok' => false, 'mensaje' => 'No hay una sesión activa.'], 401);
}

responderJson(['ok' => true, 'usuario' => $usuario]);
