<?php

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';

$usuarioActual = exigirSesion();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $esAdmin = $usuarioActual['rol'] === 'admin';
    $sql = "SELECT r.id_reserva, r.id_usuario, r.id_clase, u.nombre AS cliente,
                   c.nombre_clase AS clase, c.horario, r.fecha, r.estado,
                   r.fecha_reserva
            FROM reservas r
            INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
            INNER JOIN clases c ON c.id_clase = r.id_clase";

    if (!$esAdmin) {
        $sql .= ' WHERE r.id_usuario = ?';
    }

    $sql .= ' ORDER BY r.fecha DESC, c.horario';
    $consulta = $conexion->prepare($sql);

    if (!$esAdmin) {
        $consulta->bind_param('i', $usuarioActual['id_usuario']);
    }

    $consulta->execute();
    $reservas = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);
    $consulta->close();
    $conexion->close();
    responderJson(['ok' => true, 'reservas' => $reservas]);
}

if ($metodo === 'POST') {
    $idClase = filter_input(INPUT_POST, 'id_clase', FILTER_VALIDATE_INT);
    $fecha = $_POST['fecha'] ?? '';
    $idUsuario = $usuarioActual['id_usuario'];

    if ($usuarioActual['rol'] === 'admin') {
        if (isset($_POST['id_usuario'])) {
            $idUsuario = filter_var($_POST['id_usuario'], FILTER_VALIDATE_INT);
        } elseif (!empty($_POST['cliente'])) {
            $buscarUsuario = $conexion->prepare('SELECT id_usuario FROM usuarios WHERE nombre = ? LIMIT 1');
            $buscarUsuario->bind_param('s', $_POST['cliente']);
            $buscarUsuario->execute();
            $usuarioEncontrado = $buscarUsuario->get_result()->fetch_assoc();
            $idUsuario = $usuarioEncontrado['id_usuario'] ?? null;
            $buscarUsuario->close();
        }

    }

    if (!$idClase && !empty($_POST['clase']) && !empty($_POST['horario'])) {
        $buscarClase = $conexion->prepare(
            'SELECT id_clase FROM clases WHERE nombre_clase = ? AND horario = ? LIMIT 1'
        );
        $buscarClase->bind_param('ss', $_POST['clase'], $_POST['horario']);
        $buscarClase->execute();
        $claseEncontrada = $buscarClase->get_result()->fetch_assoc();
        $idClase = $claseEncontrada['id_clase'] ?? null;
        $buscarClase->close();
    }

    $fechaValida = DateTime::createFromFormat('Y-m-d', $fecha);
    if (!$idClase || !$idUsuario || !$fechaValida || $fechaValida->format('Y-m-d') !== $fecha) {
        responderJson(['ok' => false, 'mensaje' => 'Datos de reserva inválidos.'], 400);
    }

    $conexion->begin_transaction();

    try {
        $clase = $conexion->prepare(
            'SELECT cupos FROM clases WHERE id_clase = ? AND estado <> "Finalizada" FOR UPDATE'
        );
        $clase->bind_param('i', $idClase);
        $clase->execute();
        $datosClase = $clase->get_result()->fetch_assoc();
        $clase->close();

        if (!$datosClase) {
            throw new RuntimeException('La clase no está disponible.');
        }

        $duplicada = $conexion->prepare(
            "SELECT id_reserva FROM reservas
             WHERE id_usuario = ? AND id_clase = ? AND fecha = ?
               AND estado IN ('Pendiente', 'Confirmada')
             LIMIT 1"
        );
        $duplicada->bind_param('iis', $idUsuario, $idClase, $fecha);
        $duplicada->execute();
        $yaReservada = $duplicada->get_result()->num_rows > 0;
        $duplicada->close();

        if ($yaReservada) {
            throw new RuntimeException('El usuario ya tiene una reserva para esta clase y fecha.');
        }

        $ocupados = $conexion->prepare(
            "SELECT COUNT(*) AS total FROM reservas
             WHERE id_clase = ? AND fecha = ?
               AND estado IN ('Pendiente', 'Confirmada')"
        );
        $ocupados->bind_param('is', $idClase, $fecha);
        $ocupados->execute();
        $totalOcupados = (int) $ocupados->get_result()->fetch_assoc()['total'];
        $ocupados->close();

        if ($totalOcupados >= (int) $datosClase['cupos']) {
            throw new RuntimeException('No quedan cupos disponibles para esa clase.');
        }

        $insertar = $conexion->prepare(
            "INSERT INTO reservas (id_usuario, id_clase, fecha, estado)
             VALUES (?, ?, ?, 'Pendiente')"
        );
        $insertar->bind_param('iis', $idUsuario, $idClase, $fecha);
        $insertar->execute();
        $idReserva = $conexion->insert_id;
        $insertar->close();
        $conexion->commit();
        $conexion->close();

        responderJson(['ok' => true, 'id_reserva' => $idReserva], 201);
    } catch (Throwable $error) {
        $conexion->rollback();
        $conexion->close();
        responderJson(['ok' => false, 'mensaje' => $error->getMessage()], 409);
    }
}

if ($metodo === 'PUT' || $metodo === 'DELETE') {
    parse_str(file_get_contents('php://input'), $datos);
    $idReserva = filter_var($datos['id_reserva'] ?? null, FILTER_VALIDATE_INT);

    if (!$idReserva) {
        responderJson(['ok' => false, 'mensaje' => 'Reserva inválida.'], 400);
    }

    if ($metodo === 'DELETE') {
        $estado = 'Cancelada';
    } else {
        $estado = $datos['estado'] ?? '';
        if (!in_array($estado, ['Confirmada', 'Pendiente', 'Cancelada'], true)) {
            responderJson(['ok' => false, 'mensaje' => 'Estado inválido.'], 400);
        }
    }

    $esAdmin = $usuarioActual['rol'] === 'admin';
    if ($esAdmin) {
        $consulta = $conexion->prepare('UPDATE reservas SET estado = ? WHERE id_reserva = ?');
        $consulta->bind_param('si', $estado, $idReserva);
    } else {
        $consulta = $conexion->prepare('UPDATE reservas SET estado = ? WHERE id_reserva = ? AND id_usuario = ?');
        $consulta->bind_param('sii', $estado, $idReserva, $usuarioActual['id_usuario']);
    }

    $consulta->execute();
    $actualizadas = $consulta->affected_rows;
    $consulta->close();
    $conexion->close();

    if ($actualizadas === 0) {
        responderJson(['ok' => false, 'mensaje' => 'La reserva no existe o no te pertenece.'], 404);
    }

    responderJson(['ok' => true, 'actualizadas' => $actualizadas]);
}

responderJson(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
