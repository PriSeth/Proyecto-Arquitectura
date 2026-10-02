<?php

$servidor = "localhost";
$puerto = 3306;
$usuario = "root";
$contrasena = "";
$base_datos = "gimnasio"; //nombre de la base 

$conexion = new mysqli($servidor, $usuario, $contrasena, $base_datos);


if ($conexion->connect_error) {
    die("Error de conexión a la base de datos: " . $conexion->connect_error);
}


$conexion->set_charset("utf8mb4");

?>
