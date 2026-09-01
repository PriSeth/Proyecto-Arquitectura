<?php

header('Content-Type: application/json');

$secretKey = '6Ld3RaMtAAAAAMhvwO7QsqhXhhw0f-pli_kZfI80';

if (!isset($_POST['captcha'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No se recibió el CAPTCHA.'
    ]);
    exit;
}

$captcha = $_POST['captcha'];

$url = 'https://www.google.com/recaptcha/api/siteverify';

$data = [
    'secret' => $secretKey,
    'response' => $captcha
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);

$response = file_get_contents($url, false, $context);

$result = json_decode($response, true);

if ($result['success']) {
    echo json_encode([
        'success' => true,
        'message' => 'CAPTCHA válido.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'CAPTCHA inválido.'
    ]);
}