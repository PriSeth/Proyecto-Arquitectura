const buscarRut = document.getElementById('buscarRut');
const botonesGestion = document.getElementById('botonesGestion');
const btnModificar = document.getElementById('btnModificar');
const btnEliminar = document.getElementById('btnEliminar');
const btnCancelarCambios = document.getElementById('btnCancelarCambios');
const seccionCampos = document.getElementById('seccionCampos');

const idUsuario = document.getElementById('idUsuario');
const campoRut = document.getElementById('campoRut');
const campoUsuario = document.getElementById('campoUsuario');
const campoNombre = document.getElementById('campoNombre');
const campoContrasena = document.getElementById('campoContrasena');
const campoRol = document.getElementById('campoRol');
const campoTelefono = document.getElementById('campoTelefono');
const campoCorreo = document.getElementById('campoCorreo');
const formGestionUsuario = document.getElementById('formGestionUsuario');
let datosOriginales = null;

function estadoInicial() {
	botonesGestion.hidden = true;
	btnModificar.hidden = false;
	btnEliminar.hidden = false;
	seccionCampos.hidden = true;
}

function limpiarFormulario() {
	idUsuario.value = '';
	campoRut.value = '';
	campoUsuario.value = '';
	campoNombre.value = '';
	campoContrasena.value = '';
	campoRol.value = 'cliente';
	campoTelefono.value = '';
	campoCorreo.value = '';
	datosOriginales = null;

	formGestionUsuario.querySelectorAll('.wrap-input100').forEach(function (contenedor) {
		contenedor.classList.remove('alert-validate');
		contenedor.classList.remove('confirm-validate');
	});
}

campoUsuario.addEventListener('input', function () {
	this.value = this.value.replace(/[^A-Za-z0-9_]/g, '');
});

campoNombre.addEventListener('input', function () {
	this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '').replace(/\s{2,}/g, ' ');
});

campoNombre.addEventListener('blur', function () {
	this.value = this.value.trim();
});

campoContrasena.addEventListener('input', function () {
	this.value = this.value.replace(/\s/g, '');
});

campoTelefono.addEventListener('input', function () {
	let valor = this.value.replace(/\D/g, '');
	valor = valor.replace(/^9/, '');
	valor = valor.slice(0, 8);
	this.value = '9' + valor;

	if (this.selectionStart < 1) {
		this.setSelectionRange(1, 1);
	}

});

campoCorreo.addEventListener('input', function () {
	this.value = this.value.replace(/\s/g, '');
});

function correoEsValido(valor) {
	return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(valor.trim());
}

function contrasenaEsValida(valor) {
	return valor === '' || /^\S{4,8}$/.test(valor);
}

function validarCampo(campo) {
	const contenedor = campo.closest('.wrap-input100');
	if (!contenedor || !contenedor.classList.contains('validate-input')) {
		return true;
	}

	if (campo === campoCorreo) {
		campo.setCustomValidity(correoEsValido(campo.value) ? '' : 'Ingresa un correo válido, por ejemplo: usuario@dominio.com');
	} else if (campo === campoContrasena) {
		campo.setCustomValidity(contrasenaEsValida(campo.value) ? '' : 'La contraseña debe tener entre 4 y 8 caracteres, sin espacios');
	} else {
		campo.setCustomValidity('');
		if (!campo.checkValidity()) {
			campo.setCustomValidity(contenedor.dataset.validate || 'Dato inválido');
		}
	}

	const campoValido = campo.checkValidity();
	contenedor.classList.toggle('confirm-validate', campoValido);
	contenedor.classList.toggle('alert-validate', !campoValido);

	return campoValido;
}

const camposConTicket = [campoUsuario, campoNombre, campoContrasena, campoTelefono, campoCorreo];

camposConTicket.forEach(function (campo) {
	campo.addEventListener('input', function () {
		validarCampo(campo);
	});
	campo.addEventListener('blur', function () {
		validarCampo(campo);
	});
});

buscarRut.addEventListener('input', function () {
	let valor = this.value.toUpperCase().replace(/[^0-9K]/g, '').substring(0, 9);

	if (valor.includes('K')) {
		valor = valor.replace(/K/g, '') + 'K';
	}

	if (valor.length <= 1) {
		this.value = valor;
		return;
	}

	const cuerpo = valor.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	const dv = valor.slice(-1);
	this.value = cuerpo + '-' + dv;
});

async function buscarUsuarioPorRut() {
	const rut = buscarRut.value.trim();
	if (!rut) {
		alert('Ingresa un RUT para buscar.');
		return;
	}

	const respuesta = await fetch('php/usuarios.php?rut=' + encodeURIComponent(rut));
	const resultado = await respuesta.json();

	if (!respuesta.ok || !resultado.ok || !resultado.usuarios.length) {
		limpiarFormulario();
		estadoInicial();
		alert('No se encontró un usuario con ese RUT.');
		return;
	}

	const u = resultado.usuarios[0];
	idUsuario.value = u.id_usuario;
	campoRut.value = u.rut;
	campoUsuario.value = u.usuario;
	campoNombre.value = u.nombre;
	campoContrasena.value = '';
	campoRol.value = u.rol;
	campoTelefono.value = u.telefono;
	campoCorreo.value = u.correo;
	datosOriginales = {
		idUsuario: u.id_usuario,
		rut: u.rut,
		usuario: u.usuario,
		nombre: u.nombre,
		rol: u.rol,
		telefono: u.telefono,
		correo: u.correo
	};

	seccionCampos.hidden = true;
	botonesGestion.hidden = false;
	btnModificar.hidden = false;
	btnEliminar.hidden = false;
}

buscarRut.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		buscarUsuarioPorRut();
	}
});

const parametrosUrl = new URLSearchParams(window.location.search);
const rutDesdeUrl = parametrosUrl.get('rut');
if (rutDesdeUrl) {
	buscarRut.value = rutDesdeUrl;
	buscarUsuarioPorRut();
}

btnModificar.addEventListener('click', function () {
	btnEliminar.hidden = true;
	seccionCampos.hidden = false;
	camposConTicket.forEach(validarCampo);
});

btnCancelarCambios.addEventListener('click', function () {
	buscarRut.value = '';
	limpiarFormulario();
	estadoInicial();
	buscarRut.focus();
});

btnEliminar.addEventListener('click', async function () {
	btnModificar.hidden = true;

	if (!confirm('¿Eliminar definitivamente a "' + campoNombre.value + '"? Esta acción no se puede deshacer.')) {
		btnModificar.hidden = false;
		return;
	}

	try {
		const respuesta = await fetch('php/usuarios.php', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ id_usuario: idUsuario.value })
		});
		const resultado = await respuesta.json();
		if (!respuesta.ok || !resultado.ok) {
			throw new Error(resultado.mensaje || 'No se pudo eliminar el usuario.');
		}
		alert('Usuario eliminado correctamente.');
		buscarRut.value = '';
		limpiarFormulario();
		estadoInicial();
	} catch (error) {
		alert(error.message);
		btnModificar.hidden = false;
	}
});

formGestionUsuario.addEventListener('submit', async function (event) {
	event.preventDefault();

	let formularioValido = true;
	let primerCampoInvalido = null;
	camposConTicket.forEach(function (campo) {
		const valido = validarCampo(campo);
		if (!valido && formularioValido) {
			formularioValido = false;
			primerCampoInvalido = campo;
		}
	});

	if (!formularioValido) {
		primerCampoInvalido.focus();
		return;
	}

	const datos = new URLSearchParams({
		id_usuario: idUsuario.value,
		rut: campoRut.value,
		usuario: campoUsuario.value.trim(),
		nombre: campoNombre.value.trim(),
		contrasena: campoContrasena.value,
		rol: campoRol.value,
		telefono: campoTelefono.value.trim(),
		correo: campoCorreo.value.trim()
	});

	try {
		const respuesta = await fetch('php/usuarios.php', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: datos
		});
		const resultado = await respuesta.json();
		if (!respuesta.ok || !resultado.ok) {
			throw new Error(resultado.mensaje || 'No se pudo modificar el usuario.');
		}
		alert('Usuario modificado correctamente.');
		buscarRut.value = '';
		limpiarFormulario();
		estadoInicial();
	} catch (error) {
		alert(error.message);
	}
});

estadoInicial();