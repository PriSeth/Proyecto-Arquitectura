<?php

require_once __DIR__ . '/sesion.php';
require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson([
        'ok' => false,
        'mensaje' => 'Método no permitido.'
    ], 405);
}

$correo = trim($_POST['correo'] ?? '');

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responderJson([
        'ok' => false,
        'mensaje' => 'Correo inválido.'
    ], 400);
}

$codigo = (string) random_int(100000, 999999);

$_SESSION['verificacion'] = [
    'codigo'   => $codigo,
    'correo'   => $correo,
    'expira'   => time() + 300,
    'intentos' => 0
];

unset($_SESSION['correo_verificado']);

try {

    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username = 'fitlifegym606@gmail.com';
    $mail->Password = 'vizi fdld qzpz zilh';
    $mail->setFrom('micuenta@gmail.com', 'FitLife');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet = 'UTF-8';


    $mail->addAddress($correo);

    $mail->isHTML(false);
    $mail->Subject = 'Tu código de verificación - FitLife';

    $mail->Body =
        "Hola,\n\n" .
        "Tu código de verificación para FitLife es:\n\n" .
        $codigo . "\n\n" .
        "Este código vence en 5 minutos.\n\n" .
        "Si no solicitaste este código, puedes ignorar este mensaje.";

    $mail->send();

    responderJson([
        'ok' => true,
        'mensaje' => 'Código enviado a tu correo.'
    ]);

} catch (Exception $e) {

    error_log('PHPMailer: ' . $mail->ErrorInfo);

    responderJson([
        'ok' => false,
        'mensaje' => 'No se pudo enviar el correo.',
        'error' => $mail->ErrorInfo
    ], 500);
}