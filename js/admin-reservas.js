let reservas = [];
let usuarioSesion = null;
let esAdmin = false;

const tabSolicitudes = document.getElementById('tabSolicitudes');
const tabReservas = document.getElementById('tabReservas');
const panelSolicitudes = document.getElementById('panelSolicitudes');
const panelReservas = document.getElementById('panelReservas');
const tablaBody = document.getElementById('tablaReservasBody');
const estadoVacio = document.getElementById('estadoVacio');
const buscador = document.getElementById('buscador');
const formReserva = document.getElementById('formReserva');
const modalReserva = $('#modalReserva');
const modalTitulo = document.getElementById('modalReservaTitulo');
const tablaSolicitudesBody = document.getElementById('tablaSolicitudesBody');
const estadoVacioSolicitudes = document.getElementById('estadoVacioSolicitudes');
const buscadorSolicitudes = document.getElementById('buscadorSolicitudes');
const claseSeleccionada = new URLSearchParams(window.location.search).get('clase');

function fechaHoy() {
	const fecha = new Date();
	const mes = String(fecha.getMonth() + 1).padStart(2, '0');
	const dia = String(fecha.getDate()).padStart(2, '0');
	return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function activarTab(nombre) {
	const esSolicitudes = nombre === 'solicitudes';
	tabSolicitudes.classList.toggle('active', esSolicitudes);
	tabReservas.classList.toggle('active', !esSolicitudes);
	panelSolicitudes.classList.toggle('active', esSolicitudes);
	panelReservas.classList.toggle('active', !esSolicitudes);
}

tabSolicitudes.addEventListener('click', function () { activarTab('solicitudes'); });
tabReservas.addEventListener('click', function () { activarTab('reservas'); });

function claseBadge(estado) {
	if (estado === 'Confirmada') return 'badge-confirmada';
	if (estado === 'Pendiente') return 'badge-pendiente';
	return 'badge-cancelada';
}

async function cargarReservas() {
	const respuesta = await fetch('php/reservas.php');
	const resultado = await respuesta.json();
	if (!respuesta.ok || !resultado.ok) {
		throw new Error(resultado.mensaje || 'No se pudieron cargar las reservas.');
	}
	reservas = resultado.reservas;
	renderTabla(buscador.value);
	renderSolicitudes(buscadorSolicitudes.value);
}

function renderTabla(filtro = '') {
	tablaBody.innerHTML = '';
	const filtroLower = filtro.trim().toLowerCase();
	const listaFiltrada = reservas.filter(function (reserva) {
		return reserva.cliente.toLowerCase().includes(filtroLower) ||
			reserva.clase.toLowerCase().includes(filtroLower);
	});

	estadoVacio.style.display = listaFiltrada.length === 0 ? 'block' : 'none';
	listaFiltrada.forEach(function (reserva) {
		const fila = document.createElement('tr');
		fila.innerHTML = `
			<td>${reserva.id_reserva}</td>
			<td>${reserva.cliente}</td>
			<td>${reserva.clase}</td>
			<td>${reserva.horario}</td>
			<td>${reserva.fecha}</td>
			<td><span class="badge-estado ${claseBadge(reserva.estado)}">${reserva.estado}</span></td>
			<td class="acciones-reserva" ${esAdmin ? '' : 'hidden'}>
				<button type="button" class="btn-icon edit" title="Cambiar estado" data-id="${reserva.id_reserva}">
					<i class="fa fa-pencil"></i>
				</button>
				<button type="button" class="btn-icon delete" title="Cancelar" data-id="${reserva.id_reserva}">
					<i class="fa fa-trash"></i>
				</button>
			</td>
		`;
		tablaBody.appendChild(fila);
	});
}

function renderSolicitudes(filtro = '') {
	tablaSolicitudesBody.innerHTML = '';
	const filtroLower = filtro.trim().toLowerCase();
	const solicitudes = reservas.filter(reserva => reserva.estado === 'Pendiente');
	const listaFiltrada = solicitudes.filter(function (solicitud) {
		return solicitud.cliente.toLowerCase().includes(filtroLower) ||
			solicitud.clase.toLowerCase().includes(filtroLower);
	});

	estadoVacioSolicitudes.style.display = listaFiltrada.length === 0 ? 'block' : 'none';
	listaFiltrada.forEach(function (solicitud) {
		const fila = document.createElement('tr');
		fila.innerHTML = `
			<td>${solicitud.id_reserva}</td>
			<td>${solicitud.cliente}</td>
			<td>${solicitud.clase}</td>
			<td>${solicitud.horario}</td>
			<td>${solicitud.fecha}</td>
			<td>
				<button type="button" class="btn-admin-outline approve" data-id="${solicitud.id_reserva}">Aprobar</button>
				<button type="button" class="btn-admin-outline reject" data-id="${solicitud.id_reserva}">Rechazar</button>
			</td>
		`;
		tablaSolicitudesBody.appendChild(fila);
	});
}

async function cambiarEstado(idReserva, estado) {
	const respuesta = await fetch('php/reservas.php', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ id_reserva: idReserva, estado })
	});
	const resultado = await respuesta.json();
	if (!respuesta.ok || !resultado.ok) throw new Error(resultado.mensaje || 'No se pudo actualizar la reserva.');
	await cargarReservas();
}

const horariosPorClase = {
	Zumba: '08:30',
	Spinning: '09:30',
	Yoga: '10:30',
	Funcional: '11:30',
	Pilates: '12:30'
};

formReserva.querySelector('select[name="clase"]').addEventListener('change', function () {
	formReserva.querySelector('input[name="horario"]').value = horariosPorClase[this.value] || '';
});

document.getElementById('btnNuevaReserva').addEventListener('click', function () {
	formReserva.reset();
	formReserva.querySelector('input[name="id"]').value = '';
	formReserva.querySelector('input[name="fecha"]').value = fechaHoy();
	if (!esAdmin && usuarioSesion) {
		const campoCliente = formReserva.querySelector('input[name="cliente"]');
		campoCliente.value = usuarioSesion.nombre;
		campoCliente.readOnly = true;
	}
	modalTitulo.textContent = 'Nueva reserva';
	modalReserva.modal('show');
});

async function cargarClaseSeleccionada() {
	if (!claseSeleccionada) return;

	const respuesta = await fetch(`php/clases_disponibles.php?fecha=${fechaHoy()}`);
	const resultado = await respuesta.json();
	if (!respuesta.ok || !resultado.ok) return;

	const clase = resultado.clases.find(item => String(item.id_clase) === claseSeleccionada);
	if (!clase) return;

	formReserva.reset();
	formReserva.querySelector('input[name="fecha"]').value = fechaHoy();
	formReserva.querySelector('select[name="clase"]').value = clase.nombre_clase;
	formReserva.querySelector('input[name="horario"]').value = clase.horario;
	if (!esAdmin && usuarioSesion) {
		const campoCliente = formReserva.querySelector('input[name="cliente"]');
		campoCliente.value = usuarioSesion.nombre;
		campoCliente.readOnly = true;
	}
	modalTitulo.textContent = 'Nueva reserva';
	modalReserva.modal('show');
}

tablaBody.addEventListener('click', async function (event) {
	const btnEditar = event.target.closest('.btn-icon.edit');
	const btnEliminar = event.target.closest('.btn-icon.delete');
	const id = (btnEditar || btnEliminar)?.getAttribute('data-id');
	if (!id) return;

	try {
		if (btnEditar) {
			const reserva = reservas.find(item => String(item.id_reserva) === id);
			if (!reserva) return;
			const nuevoEstado = prompt('Estado: Confirmada, Pendiente o Cancelada', reserva.estado);
			if (nuevoEstado && ['Confirmada', 'Pendiente', 'Cancelada'].includes(nuevoEstado)) {
				await cambiarEstado(id, nuevoEstado);
			}
		}

		if (btnEliminar && confirm('¿Cancelar esta reserva?')) {
			await cambiarEstado(id, 'Cancelada');
		}
	} catch (error) {
		alert(error.message);
	}
});

formReserva.addEventListener('submit', async function (event) {
	event.preventDefault();
	const datos = new FormData(formReserva);
	const cliente = datos.get('cliente').trim();
	const clase = datos.get('clase');
	const horario = datos.get('horario');
	const fecha = datos.get('fecha');

	if (!cliente || !clase || !horario || !fecha) {
		alert('Por favor completa todos los campos.');
		return;
	}

	datos.delete('id');
	try {
		const respuesta = await fetch('php/reservas.php', { method: 'POST', body: datos });
		const resultado = await respuesta.json();
		if (!respuesta.ok || !resultado.ok) throw new Error(resultado.mensaje || 'No se pudo crear la reserva.');
		modalReserva.modal('hide');
		await cargarReservas();
	} catch (error) {
		alert(error.message);
	}
});

buscador.addEventListener('input', function () { renderTabla(this.value); });
buscadorSolicitudes.addEventListener('input', function () { renderSolicitudes(this.value); });

tablaSolicitudesBody.addEventListener('click', async function (event) {
	const boton = event.target.closest('[data-id]');
	if (!boton) return;
	const id = boton.getAttribute('data-id');
	const estado = boton.classList.contains('approve') ? 'Confirmada' : 'Cancelada';

	try {
		if (estado === 'Cancelada' && !confirm('¿Rechazar esta solicitud?')) return;
		await cambiarEstado(id, estado);
	} catch (error) {
		alert(error.message);
	}
});

async function cargarUsuario() {
	const respuesta = await fetch('php/usuario_actual.php');
	const resultado = await respuesta.json();
	if (!respuesta.ok || !resultado.ok) {
		window.location.href = 'index.html';
		return;
	}

	usuarioSesion = resultado.usuario;
	esAdmin = usuarioSesion.rol === 'admin';
	if (!esAdmin) {
		tabSolicitudes.hidden = true;
	}
}

cargarUsuario()
	.then(cargarReservas)
	.then(cargarClaseSeleccionada)
	.catch(function (error) {
		alert(error.message);
	});
