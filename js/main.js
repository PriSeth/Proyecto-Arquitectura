
(function ($) {
    "use strict";

    
    /*==================================================================
    [ Validate ]*/
    /* var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }*/

        /*Se ejecuta luego del captcha*/
    window.onCaptchaSuccess = function (token) {
        console.log("CAPTCHA resuelto, verificando en servidor...");

        fetch("php/captcha.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "captcha=" + encodeURIComponent(token)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                habilitarCorreo();
            } else {
                alert("El CAPTCHA no es válido.");
                grecaptcha.reset();
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("No se pudo verificar el CAPTCHA.");
        });
    };

    /*Si el Captch vence se bloquea todo otra vez*/
    window.onCaptchaExpired = function () {
        const correo = document.getElementById("inputCorreo");
        const contrasena = document.getElementById("inputContrasena");
        correo.disabled = true;
        contrasena.disabled = true;
        contrasena.value = "";
    };

    function habilitarCorreo() {
        const correo = document.getElementById("inputCorreo");
        correo.disabled = false;
        correo.focus();
    }

    function habilitarContrasena() {
        const contrasena = document.getElementById("inputContrasena");
        contrasena.disabled = false;
        contrasena.focus();
    }

    /* Al presionar Enter en el correo, se habilita contraseña*/
    document.getElementById("inputCorreo").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); /*Evita mandar el form antes de tiempo */
            if (this.value.trim() !== "") {
                habilitarContrasena();
            } else {
                showValidate(this);
            }
        }
    });
    
    
})(jQuery);