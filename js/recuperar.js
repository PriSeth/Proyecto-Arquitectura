(function () {
    "use strict";

    const formulario = document.getElementById("recuperarForm");
    const campoCorreo = document.getElementById("rCorreo");
    const campoCodigo = document.getElementById("rCodigo");
    const campoNueva = document.getElementById("rNueva");
    const campoConfirmar = document.getElementById("rConfirmar");
    const boton = document.getElementById("btnRecuperar");
    const estado = document.getElementById("estadoRecuperar");

    let modo = "enviar";

    const validadores = {
        correo: function (v) { return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v.trim()); },
        codigo: function (v) { return /^\d{6}$/.test(v); },
        nueva: function (v) { return /^\S{4,8}$/.test(v); },
        confirmar: function (v) { return v !== "" && v === campoNueva.value && /^\S{4,8}$/.test(v); }
    };

    function caja(campo) {
        return campo.closest(".wrap-input100");
    }

    function marcar(campo, valido) {
        const c = caja(campo);
        c.classList.toggle("confirm-validate", valido);
        c.classList.toggle("alert-validate", !valido);
    }

    function limpiarMarca(campo) {
        caja(campo).classList.remove("confirm-validate", "alert-validate");
    }

    function mostrar(mensaje, ok) {
        estado.textContent = mensaje;
        estado.className = "estado-codigo " + (ok ? "ok" : "error");
    }

    function limpiarEstado() {
        estado.textContent = "";
        estado.className = "estado-codigo";
    }

    async function llamar(url, datos) {
        const r = await fetch(url, { method: "POST", body: new URLSearchParams(datos) });
        const texto = await r.text();
        try {
            return JSON.parse(texto);
        } catch (e) {
            console.error("Respuesta no JSON de " + url + ":", texto);
            throw new Error("Respuesta inválida del servidor");
        }
    }

    function setModo(nuevo) {
        modo = nuevo;
        const camposClave = [campoCodigo, campoNueva, campoConfirmar];

        if (nuevo === "enviar") {
            boton.textContent = "Enviar código";
            boton.disabled = false;
            campoCorreo.disabled = false;
            camposClave.forEach(function (c) {
                c.value = "";
                c.disabled = true;
                limpiarMarca(c);
            });
        } else if (nuevo === "cambiar") {
            boton.textContent = "Cambiar contraseña";
            boton.disabled = false;
            camposClave.forEach(function (c) { c.disabled = false; });
        } else {
            boton.textContent = "Contraseña cambiada";
            boton.disabled = true;
            campoCorreo.disabled = true;
            camposClave.forEach(function (c) { c.disabled = true; });
        }
    }

    campoCorreo.addEventListener("input", function () {
        this.value = this.value.replace(/\s/g, "");
        if (this.value === "") limpiarMarca(this);
        else marcar(this, validadores.correo(this.value));

        if (modo === "cambiar") {
            setModo("enviar");
            limpiarEstado();
        }
    });

    campoCodigo.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
        if (this.value === "") limpiarMarca(this);
        else marcar(this, validadores.codigo(this.value));
    });

    campoNueva.addEventListener("input", function () {
        this.value = this.value.replace(/\s/g, "");
        if (this.value === "") limpiarMarca(this);
        else marcar(this, validadores.nueva(this.value));

        if (campoConfirmar.value !== "") {
            marcar(campoConfirmar, validadores.confirmar(campoConfirmar.value));
        }
    });

    campoConfirmar.addEventListener("input", function () {
        this.value = this.value.replace(/\s/g, "");
        if (this.value === "") limpiarMarca(this);
        else marcar(this, validadores.confirmar(this.value));
    });

    async function enviarCodigo() {
        if (!validadores.correo(campoCorreo.value)) {
            marcar(campoCorreo, false);
            mostrar("Escribe un correo válido.", false);
            campoCorreo.focus();
            return;
        }

        boton.disabled = true;
        estado.className = "estado-codigo";
        estado.textContent = "Enviando código...";
        try {
            const j = await llamar("php/recuperar_enviar.php", { correo: campoCorreo.value.trim() });
            mostrar(j.mensaje, j.ok);
            if (j.ok) {
                setModo("cambiar");
                campoCodigo.focus();
            }
        } catch (e) {
            mostrar("No se pudo enviar el código. Intenta de nuevo.", false);
        } finally {
            if (modo !== "listo") boton.disabled = false;
        }
    }

    async function cambiarContrasena() {
        const revisiones = [
            [campoCodigo, validadores.codigo(campoCodigo.value), "Ingresa el código de 6 dígitos."],
            [campoNueva, validadores.nueva(campoNueva.value), "La contraseña debe tener entre 4 y 8 caracteres, sin espacios."],
            [campoConfirmar, validadores.confirmar(campoConfirmar.value), "Las contraseñas no coinciden."]
        ];

        for (let i = 0; i < revisiones.length; i++) {
            if (!revisiones[i][1]) {
                marcar(revisiones[i][0], false);
                mostrar(revisiones[i][2], false);
                revisiones[i][0].focus();
                return;
            }
        }

        boton.disabled = true;
        estado.className = "estado-codigo";
        estado.textContent = "Guardando...";
        try {
            const j = await llamar("php/recuperar_cambiar.php", {
                codigo: campoCodigo.value,
                contrasena: campoNueva.value,
                confirmar: campoConfirmar.value
            });

            if (j.ok) {
                setModo("listo");
                mostrar(j.mensaje, true);
                setTimeout(function () { window.location.href = "index.html"; }, 2500);
            } else if (/nuevo/i.test(j.mensaje || "")) {
                setModo("enviar");
                mostrar(j.mensaje, false);
            } else {
                mostrar(j.mensaje, false);
                if (/c[oó]digo/i.test(j.mensaje || "")) {
                    caja(campoCodigo).setAttribute("data-validate", j.mensaje);
                    marcar(campoCodigo, false);
                    campoCodigo.focus();
                }
            }
        } catch (e) {
            mostrar("No se pudo cambiar la contraseña. Intenta de nuevo.", false);
        } finally {
            if (modo !== "listo") boton.disabled = false;
        }
    }

    boton.addEventListener("click", function () {
        if (modo === "enviar") enviarCodigo();
        else if (modo === "cambiar") cambiarContrasena();
    });

    formulario.addEventListener("submit", function (e) {
        e.preventDefault();
        boton.click();
    });

    setModo("enviar");
})();
