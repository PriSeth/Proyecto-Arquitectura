<?php

require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;

try {
    $mail = new PHPMailer(true);

    echo "PHPMailer cargado correctamente.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}