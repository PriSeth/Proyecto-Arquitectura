<?php

$servidor = "sql310.infinityfree.com";
$puerto = 3306;
$usuario = "if0_43072211";
$contrasena = "PJbz6CVANiN";
$base_datos = "if0_43072211_gimnasio";

$conexion = new mysqli(
    $servidor,
    $usuario,
    $contrasena,
    $base_datos,
    $puerto
);

if ($conexion->connect_error) {
    die("Error de conexión a la base de datos: " . $conexion->connect_error);
}

$conexion->set_charset("utf8mb4");

?>
