$('.js-tilt').tilt({
	scale: 1.1
})

document.getElementById('btnOtroRegistro').addEventListener('click', function () {
	document.getElementById('registroForm').reset();
	document.querySelectorAll('#registroForm .alert-validate').forEach(function (campo) {
		campo.classList.remove('alert-validate');
	});
	document.querySelector('#registroForm input').focus();
});

document.querySelector('input[name="telefono"]').addEventListener('input', function () {
	this.value = this.value.replace(/[^0-9]/g, '');
});

document.getElementById('registroForm').addEventListener('submit', function (event) {
	event.preventDefault();
	const campos = this.querySelectorAll('input');
	let formularioValido = true;

	campos.forEach(function (campo) {
		const contenedor = campo.closest('.validate-input');
		const campoValido = campo.checkValidity();
		contenedor.classList.toggle('alert-validate', !campoValido);

		if (!campoValido && formularioValido) {
			formularioValido = false;
			campo.focus();
		}
	});

	if (formularioValido) {
		alert('En construcción');
	}
});

