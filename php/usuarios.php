<?php

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

exigirAdmin();

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET'){
    $idFiltro = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

    $sql = 'SELECT id_usuario, nombre, rut, correo, usuario, telefono, rol, fecha_registro
            FROM usuarios';
    if ($idFiltro) {
        $sql .= ' WHERE id_usuario = ?';
    }
    $sql .= ' ORDER BY nombre';

    $consulta = $conexion->prepare($sql);
    if ($idFiltro) {
        $consulta->bind_param('i', $idFiltro);
    }
    $consulta->execute();
    $usuarios = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);
    $consulta->close();
    $conexion->close();

    responderJson(['ok' => true, 'usuarios' => $usuarios]);
}

if ($metodo === 'PUT') {
    parse_str(file_get_contents('php://input'), $datos);

    $idUsuario = filter_var($datos['id_usuario'] ?? null, FILTER_VALIDATE_INT);
    $nombre = trim($datos['nombre'] ?? '');
    $rut = trim($datos['rut'] ?? '');
    $correo = trim($datos['correo'] ?? '');
    $usuario = trim($datos['usuario'] ?? '');
    $telefono = trim($datos['telefono'] ?? '');
    $rol = $datos['rol'] ?? '';
    $contrasena = $datos['contrasena'] ?? '';

    if (!$idUsuario || $nombre === '' || $rut === ''
        || !filter_var($correo, FILTER_VALIDATE_EMAIL)
        || !preg_match('/^[A-Za-z0-9_]{3,10}$/', $usuario)
        || !preg_match('/^9[0-9]{8}$/', $telefono)
        || !in_array($rol, ['cliente', 'admin'], true)) {
        responderJson(['ok' => false, 'mensaje' => 'Revisa los datos ingresados.'], 400);
    }

    if ($contrasena !== '' && !preg_match('/^\S{4,8}$/', $contrasena)) {
        responderJson(['ok' => false, 'mensaje' => 'La contraseña debe tener entre 4 y 8 caracteres.'], 400);
    }

    if ($contrasena !== '') {
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);
        $consulta = $conexion->prepare(
            'UPDATE usuarios
             SET nombre = ?, rut = ?, correo = ?, usuario = ?, telefono = ?, rol = ?, contrasena = ?
             WHERE id_usuario = ?'
        );
        $consulta->bind_param('sssssssi', $nombre, $rut, $correo, $usuario, $telefono, $rol, $hash, $idUsuario);
    } else {
        $consulta = $conexion->prepare(
            'UPDATE usuarios
             SET nombre = ?, rut = ?, correo = ?, usuario = ?, telefono = ?, rol = ?
             WHERE id_usuario = ?'
        );
        $consulta->bind_param('ssssssi', $nombre, $rut, $correo, $usuario, $telefono, $rol, $idUsuario);
    }

    if (!$consulta->execute()) {
        $consulta->close();
        $conexion->close();

        if ($conexion->errno === 1062) {
            responderJson(['ok' => false, 'mensaje' => 'El RUT, correo o usuario ya está en uso por otro usuario.'], 409);
        }

        responderJson(['ok' => false, 'mensaje' => 'No se pudo actualizar el usuario.'], 500);
    }

    $actualizados = $consulta->affected_rows;
    $consulta->close();
    $conexion->close();

    responderJson(['ok' => true, 'actualizados' => $actualizados]);
}

responderJson(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
