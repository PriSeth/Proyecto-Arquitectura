<?php

$servidor = "sql207.infinityfree.com";
$puerto = 3306;
$usuario = "if0_43072385";
$contrasena = "HPTPCA48KW";
$base_datos = "if0_43072385_gimnasio";

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
