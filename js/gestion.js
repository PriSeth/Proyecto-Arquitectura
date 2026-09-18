const buscarRut = document.getElementById('buscarRut');
const botonesGestion = document.getElementById('botonesGestion');
const btnModificar = document.getElementById('btnModificar');
const btnEliminar = document.getElementById('btnEliminar');
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
}

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
