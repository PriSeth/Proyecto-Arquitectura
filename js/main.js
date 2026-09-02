
(function ($) {
    "use strict";

    const usuario = document.getElementById("inputUsuario");
    const contrasena = document.getElementById("inputContrasena");
    const botonLogin = document.getElementById("btnLogin");
    const contadorIntentos = document.getElementById("contadorIntentos");

    const credencialesValidas = {
        usuario: "admin",
        contrasena: "1234"
    };

    if (!usuario || !contrasena || !botonLogin) {
        return;
    }

    let intentosFallidos = 0;
    let bloqueoActivo = false;
    const duracionBloqueo = 60;

    function actualizarContador() {
        contadorIntentos.textContent = "Intentos: " + intentosFallidos + " de 3";
    }

    function limpiarCredenciales() {
        usuario.value = "";
        contrasena.value = "";
        contrasena.disabled = true;
    }

    function actualizarEstadoBloqueo(segundosRestantes) {
        botonLogin.textContent = "Bloqueado (" + segundosRestantes + " s)";
    }

    function bloquearLogin() {
        bloqueoActivo = true;
        usuario.disabled = true;
        contrasena.disabled = true;
        botonLogin.disabled = true;

        let segundosRestantes = duracionBloqueo;
        actualizarEstadoBloqueo(segundosRestantes);

        const temporizador = setInterval(function () {
            segundosRestantes -= 1;
            actualizarEstadoBloqueo(segundosRestantes);

            if (segundosRestantes <= 0) {
                clearInterval(temporizador);
                bloqueoActivo = false;
                intentosFallidos = 0;
                actualizarContador();
                usuario.disabled = false;
                contrasena.disabled = true;
                botonLogin.disabled = false;
                botonLogin.textContent = "Iniciar Sesión";
                usuario.focus();
            }
        }, 1000);
    }

    function procesarLogin() {
        if (bloqueoActivo) {
            return;
        }

        const usuarioIngresado = usuario.value.trim();
        const contrasenaIngresada = contrasena.value;
        const credencialesCorrectas = usuarioIngresado === credencialesValidas.usuario
            && contrasenaIngresada === credencialesValidas.contrasena;

        if (credencialesCorrectas) {
            alert("Inicio de sesión exitoso.");
            intentosFallidos = 0;
            actualizarContador();
            return;
        }

        intentosFallidos += 1;
        actualizarContador();
        limpiarCredenciales();

        /* Recargar Captcha*/
        if (typeof grecaptcha !== "underfined"){
            grecaptcha.reset();
        }

        if (intentosFallidos >= 3) {
            alert("Has alcanzado el límite de intentos. Intente nuevamente en 1 minuto.");
            bloquearLogin();
        } else {
            alert("Usuario o contraseña incorrectos. Intento " + intentosFallidos + " de 3.");
            usuario.disabled = false;
            usuario.focus();
        }
    }

    botonLogin.addEventListener("click", procesarLogin);

        /*Se ejecuta luego del captcha*/
        window.onCaptchaExpired = function () {
        usuario.disabled = true;
        contrasena.disabled = true;
        botonLogin.disabled = true;
        contrasena.value = "";
    };

    function habilitarUsuario() {
        usuario.disabled = false;
        usuario.focus();
    }

    function habilitarContrasena() {
        const contrasena = document.getElementById("inputContrasena");
        contrasena.disabled = false;
        contrasena.focus();
    }
    function habilitarbotonLogin() {
    if (contrasena.value.trim() !== "") {
        botonLogin.disabled = false;
    } else {
        botonLogin.disabled = true;
    }
}

    /*Si el Captch vence se bloquea todo otra vez*/
    window.onCaptchaExpired = function () {
        usuario.disabled = true;
        contrasena.disabled = true;
        contrasena.value = "";
    };

    function habilitarUsuario() {
        usuario.disabled = false;
        usuario.focus();
    }

    function habilitarContrasena() {
        const contrasena = document.getElementById("inputContrasena");
        contrasena.disabled = false;
        contrasena.focus();
    }

    /* Al presionar Enter en el correo, se habilita contraseña*/
    usuario.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); /*Evita mandar el form antes de tiempo */
            if (this.value.trim() !== "") {
                habilitarContrasena();
            } else {
                alert("El usuario es requerido.");
            }
        }
    });

    contrasena.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            procesarLogin();
        }
    });
    
    
})(jQuery);