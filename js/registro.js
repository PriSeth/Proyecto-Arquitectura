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

    btnOtroRegistro.addEventListener("click", function () {

        formulario.reset();
        telefono.value = "9";

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
        if (/^[0-9]$/.test(e.key)){
            e.preventDefault();
        }
    })


    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        const campos = this.querySelectorAll("input");

        let formularioValido = true;

        campos.forEach(function (campo) {

            const contenedor = campo.closest(".validate-input");
            const campoValido = campo.checkValidity();

            contenedor.classList.toggle(
                "alert-validate",
                !campoValido
            );

            if (!campoValido && formularioValido) {

                formularioValido = false;

                campo.focus();
            }
        });

        if (formularioValido) {

            alert("En construcción");

        }

    });

})();