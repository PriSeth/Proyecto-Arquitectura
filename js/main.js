(function ($) {
    "use strict";

    const usuario = document.getElementById("inputUsuario");
    const contrasena = document.getElementById("inputContrasena");
    const botonLogin = document.getElementById("btnLogin");
    const contadorIntentos = document.getElementById("contadorIntentos");
    

    if (!usuario || !contrasena || !botonLogin) {
        return;
    }

    const formularioLogin = document.querySelector(".login100-form");
    formularioLogin.addEventListener("submit", function (e) {
        e.preventDefault();
        procesarLogin();
    });

    let intentosFallidos = 0;
    let bloqueoActivo = false;
    let captchaResuelto = false;
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
    
    async function procesarLogin() {
        if (bloqueoActivo) {
            return;
        }

        if (!captchaResuelto) {
            alert("Debes completar la verificación de seguridad (captcha) antes de ingresar.");
            reiniciarCaptcha();
            return;
        }

        const datos = new FormData();
        datos.append("usuario", usuario.value.trim());
        datos.append("contrasena", contrasena.value);

        try {
            const respuesta = await fetch("php/iniciar_sesion.php", {
                method: "POST",
                body: datos
            });
            const resultado = await respuesta.json();

            if (respuesta.ok && resultado.ok) {
                intentosFallidos = 0;
                actualizarContador();
                window.location.href = resultado.redireccion;
                return;
            }

            throw new Error(resultado.mensaje || "No se pudo iniciar sesión.");
        } catch (error) {
            intentosFallidos += 1;
            actualizarContador();
            limpiarCredenciales();
            reiniciarCaptcha();

            if (intentosFallidos >= 3) {
                alert("Has alcanzado el límite de intentos. Intente nuevamente en 1 minuto.");
                bloquearLogin();
            } else {
                alert(error.message + " Intento " + intentosFallidos + " de 3.");
            }
        }
    }

    function habilitarUsuario() {
        usuario.disabled = false;
        setTimeout(function () {
        usuario.focus(); 
        }, 50);
    }

    function habilitarContrasena() {
        contrasena.disabled = false;
        contrasena.focus();
    }

    function habilitarBotonLogin() {
        botonLogin.disabled = contrasena.value.trim() === "";
    }

    /* Se ejecuta cuando el captcha se resuelve */
    const captchaStep = document.getElementById("captchaStep");
    const captchaStepDone = document.getElementById("captchaStepDone");

    function reiniciarCaptcha() {
        captchaResuelto = false;
        if (typeof grecaptcha !== "undefined") {
            grecaptcha.reset();
        }
        usuario.disabled = true;
        contrasena.disabled = true;
        contrasena.value = "";
        botonLogin.disabled = true;
        if (captchaStep) captchaStep.classList.remove("captcha-step-collapsed");
        if (captchaStepDone) captchaStepDone.hidden = true;
    }

    window.onCaptchaSuccess = function () {
        console.log("captcha resuelto, habilitando usuario");
        captchaResuelto = true;
        if (captchaStep) captchaStep.classList.add("captcha-step-collapsed");
        if (captchaStepDone) captchaStepDone.hidden = false;
        habilitarUsuario();
    };

    /* Si el captcha vence se bloquea todo otra vez */
    window.onCaptchaExpired = function () {
        captchaResuelto = false;
        usuario.disabled = true;
        contrasena.disabled = true;
        botonLogin.disabled = true;
        contrasena.value = "";
        if (captchaStep) captchaStep.classList.remove("captcha-step-collapsed");
        if (captchaStepDone) captchaStepDone.hidden = true;
    };

    /* Al presionar Enter en el usuario, se habilita contraseña */
    usuario.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (this.value.trim() !== "") {
                habilitarContrasena();
            } else {
                alert("El usuario es requerido.");
            }
        }
    });

    contrasena.addEventListener("input", habilitarBotonLogin);

    contrasena.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            procesarLogin();
        }
    });

})(jQuery);