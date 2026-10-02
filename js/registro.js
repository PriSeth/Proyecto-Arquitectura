(function () {
    "use strict";

    $('.js-tilt').tilt({
        scale: 1.1
    });

    const rut = document.getElementById("rut");
    const telefono = document.getElementById("telefono");
    const nombre = document.getElementById("name");
    const formulario = document.getElementById("registroForm");
    const btnOtroRegistro = document.getElementById("btnOtroRegistro");
    const estado = document.getElementById("estadoCodigo");

    window.correoVerificado = false;

    btnOtroRegistro.addEventListener("click", function () {

        formulario.reset();
        telefono.value = "9";
        window.correoVerificado = false;
        estado.textContent = "";

        formulario.querySelectorAll(".alert-validate").forEach(function (campo) {
            campo.classList.remove("alert-validate");
        });

        formulario.querySelector("input").focus();
    });

    telefono.value = "9";

    telefono.addEventListener("input", function () {


        let valor = this.value.replace(/[^0-9]/g, "");
        valor = valor.replace(/^9/, "");

        valor = valor.substring(0, 8);

        this.value = "9" + valor;

        if (this.selectionStart < 1) {
            this.setSelectionRange(1, 1);
        }
    })

    rut.addEventListener("input", function () {

        let valor = this.value.toUpperCase();

        valor = valor.replace(/[^0-9K]/g, "");
        valor = valor.substring(0, 9);

        if (valor.includes("K")) {
            valor = valor.replace(/K/g, "") + "K";
        }

        if (valor.length <= 1) {
            this.value = valor;
            return;
        }

        let cuerpo = valor.slice(0, -1);
        let dv = valor.slice(-1);

        cuerpo = cuerpo.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            "."
        );
        this.value = cuerpo + "-" + dv;
    });

    nombre.addEventListener("input", function () {

        this.value = this.value.replace(/[0-9]/g, "");
    });

    nombre.addEventListener("keydown", function (e) {
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    })

    function mostrar(mensaje, ok) {
        estado.textContent = mensaje;
        estado.className = "estado-codigo " + (ok ? "ok" : "error");
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

    const campoCorreo = document.getElementById("campoCorreo");
    const campoCodigo = document.getElementById("codigo");
    const btnCodigo = document.getElementById("btnCodigo");

    let modo = "enviar";

    function setModo(nuevo) {
        modo = nuevo;
        if (nuevo === "enviar") {
            btnCodigo.textContent = "Enviar código";
            btnCodigo.disabled = false;
            campoCodigo.value = "";
            campoCodigo.disabled = true;
            window.correoVerificado = false;
        } else if (nuevo === "verificar") {
            btnCodigo.textContent = "Verificar";
            btnCodigo.disabled = false;
            campoCodigo.disabled = false;
            window.correoVerificado = false;
        } else {
            btnCodigo.textContent = "Correo verificado";
            btnCodigo.disabled = true;
            campoCodigo.disabled = true;
            window.correoVerificado = true;
        }
    }

    async function enviarCodigo() {
        const correo = campoCorreo.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
            mostrar("Escribe un correo válido primero.", false);
            campoCorreo.focus();
            return;
        }

        btnCodigo.disabled = true;
        estado.className = "estado-codigo";
        estado.textContent = "Enviando código...";
        try {
            const j = await llamar("php/enviar_codigo.php", { correo: correo });
            mostrar(j.mensaje, j.ok);
            if (j.ok) {
                setModo("verificar");
                campoCodigo.focus();
            }
        } catch (e) {
            mostrar("No se pudo enviar el código. Intenta de nuevo.", false);
        } finally {
            if (modo !== "listo") btnCodigo.disabled = false;
        }
    }

    async function verificarCodigo() {
        const codigo = campoCodigo.value.trim();
        if (codigo.length !== 6) {
            mostrar("Ingresa el código de 6 dígitos.", false);
            campoCodigo.focus();
            return;
        }

        btnCodigo.disabled = true;
        estado.className = "estado-codigo";
        estado.textContent = "Verificando...";
        try {
            const j = await llamar("php/verificar_codigo.php", { codigo: codigo });
            if (j.ok) {
                setModo("listo");
            } else if (/nuevo/i.test(j.mensaje || "")) {
                setModo("enviar");
            }
            mostrar(j.mensaje, j.ok);
        } catch (e) {
            mostrar("No se pudo verificar el código. Intenta de nuevo.", false);
        } finally {
            if (modo !== "listo") btnCodigo.disabled = false;
        }
    }

    btnCodigo.addEventListener("click", function () {
        if (modo === "enviar") enviarCodigo();
        else if (modo === "verificar") verificarCodigo();
    });

    campoCodigo.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });

    campoCodigo.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            btnCodigo.click();
        }
    });

    campoCorreo.addEventListener("input", function () {
        if (modo !== "enviar") {
            setModo("enviar");
            estado.textContent = "";
            estado.className = "estado-codigo";
        }
    });

    formulario.addEventListener("reset", function () {
        setModo("enviar");
        estado.textContent = "";
        estado.className = "estado-codigo";
    });

    setModo("enviar");

})();