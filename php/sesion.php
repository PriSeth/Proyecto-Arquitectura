<?php

session_start();

function responderJson(array $datos, int $codigo = 200)
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function usuarioActual(): ?array
{
    return $_SESSION['usuario'] ?? null;
}

function exigirSesion(): array
{
    $usuario = usuarioActual();

    if (!$usuario) {
        responderJson(['ok' => false, 'mensaje' => 'Debes iniciar sesión.'], 401);
    }

    return $usuario;
}

function exigirAdmin(): array
{
    $usuario = exigirSesion();

    if ($usuario['rol'] !== 'admin') {
        responderJson(['ok' => false, 'mensaje' => 'No tienes permisos para esta acción.'], 403);
    }

    return $usuario;
}
