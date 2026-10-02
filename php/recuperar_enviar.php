<?php
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/sesion.php';
require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
}

$correo = trim($_POST['correo'] ?? '');

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responderJson(['ok' => false, 'mensaje' => 'Correo inválido.'], 400);
}

$ultimoEnvio = $_SESSION['recuperacion_ultimo_envio'] ?? 0;
if (time() - $ultimoEnvio < 30) {
    responderJson(['ok' => false, 'mensaje' => 'Espera unos segundos antes de pedir otro código.'], 429);
}
$_SESSION['recuperacion_ultimo_envio'] = time();

$consulta = $conexion->prepare('SELECT id_usuario FROM usuarios WHERE correo = ? LIMIT 1');
$consulta->bind_param('s', $correo);
$consulta->execute();
$existe = $consulta->get_result()->fetch_assoc();
$consulta->close();
$conexion->close();

unset($_SESSION['recuperacion']);

$mensajeGenerico = 'Si el correo está registrado, te enviamos un código.';

if (!$existe) {
    responderJson(['ok' => true, 'mensaje' => $mensajeGenerico]);
}

$config = require __DIR__ . '/config_correo.php';

if ($config['usuario'] === 'TU_CORREO@gmail.com') {
    unset($_SESSION['recuperacion_ultimo_envio']);
    responderJson(['ok' => false, 'mensaje' => 'Falta configurar el correo en php/config_correo.php.'], 500);
}

$codigo = (string) random_int(100000, 999999);
$_SESSION['recuperacion'] = [
    'codigo'   => $codigo,
    'correo'   => $correo,
    'expira'   => time() + 300,
    'intentos' => 0,
];

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['usuario'];
    $mail->Password   = $config['clave'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';
    $mail->setFrom($config['usuario'], $config['nombre']);
    $mail->addAddress($correo);
    $mail->Subject = 'Recupera tu contraseña de Fitlife';
    $mail->Body    = "Tu código para recuperar tu contraseña es: $codigo\nVence en 5 minutos.\n\nSi no lo pediste tú, ignora este correo.";
    $mail->send();
} catch (\Throwable $e) {
    error_log('PHPMailer (recuperar): ' . $mail->ErrorInfo);
    unset($_SESSION['recuperacion'], $_SESSION['recuperacion_ultimo_envio']);
    responderJson(['ok' => false, 'mensaje' => 'No se pudo enviar el correo. Intenta de nuevo más tarde.'], 500);
}

responderJson(['ok' => true, 'mensaje' => $mensajeGenerico]);
