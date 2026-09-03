// Datos en memoria (reemplazar por llamadas a tu backend / API real)
let reservas = [
	{ id: 1, cliente: "Ana Torres", clase: "Zumba", horario: "18:00", fecha: "2026-09-05", estado: "Confirmada" },
	{ id: 2, cliente: "Pedro Muñoz", clase: "Spinning", horario: "19:00", fecha: "2026-09-05", estado: "Pendiente" },
	{ id: 3, cliente: "Carla Reyes", clase: "Yoga", horario: "08:00", fecha: "2026-09-06", estado: "Cancelada" }
];

let solicitudes = [
	{ id: 101, cliente: "Marcos Diaz", clase: "Funcional", horario: "17:00", fecha: "2026-09-07" },
	{ id: 102, cliente: "Valentina Soto", clase: "Pilates", horario: "09:00", fecha: "2026-09-08" }
];

let siguienteId = 4;

const tabSolicitudes = document.getElementById('tabSolicitudes');
const tabReservas = document.getElementById('tabReservas');
const panelSolicitudes = document.getElementById('panelSolicitudes');
const panelReservas = document.getElementById('panelReservas');

function activarTab(nombre) {
	const esSolicitudes = nombre === 'solicitudes';
	tabSolicitudes.classList.toggle('active', esSolicitudes);
	tabReservas.classList.toggle('active', !esSolicitudes);
	panelSolicitudes.classList.toggle('active', esSolicitudes);
	panelReservas.classList.toggle('active', !esSolicitudes);
}

tabSolicitudes.addEventListener('click', function () { activarTab('solicitudes'); });
tabReservas.addEventListener('click', function () { activarTab('reservas'); });

const tablaBody = document.getElementById('tablaReservasBody');
const estadoVacio = document.getElementById('estadoVacio');
const buscador = document.getElementById('buscador');
const formReserva = document.getElementById('formReserva');
const modalReserva = $('#modalReserva');
const modalTitulo = document.getElementById('modalReservaTitulo');

function claseBadge(estado) {
	if (estado === 'Confirmada') return 'badge-confirmada';
	if (estado === 'Pendiente') return 'badge-pendiente';
	return 'badge-cancelada';
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
			<td>${reserva.id}</td>
			<td>${reserva.cliente}</td>
			<td>${reserva.clase}</td>
			<td>${reserva.horario}</td>
			<td>${reserva.fecha}</td>
			<td><span class="badge-estado ${claseBadge(reserva.estado)}">${reserva.estado}</span></td>
			<td>
				<button type="button" class="btn-icon edit" title="Editar" data-id="${reserva.id}">
					<i class="fa fa-pencil"></i>
				</button>
				<button type="button" class="btn-icon delete" title="Eliminar" data-id="${reserva.id}">
					<i class="fa fa-trash"></i>
				</button>
			</td>
		`;
		tablaBody.appendChild(fila);
	});
}

document.getElementById('btnNuevaReserva').addEventListener('click', function () {
	formReserva.reset();
	formReserva.querySelector('input[name="id"]').value = '';
	modalTitulo.textContent = 'Nueva reserva';
	modalReserva.modal('show');
});

tablaBody.addEventListener('click', function (event) {
	const btnEditar = event.target.closest('.btn-icon.edit');
	const btnEliminar = event.target.closest('.btn-icon.delete');

	if (btnEditar) {
		const id = parseInt(btnEditar.getAttribute('data-id'), 10);
		const reserva = reservas.find(item => item.id === id);
		if (!reserva) return;

		formReserva.querySelector('input[name="id"]').value = reserva.id;
		formReserva.querySelector('input[name="cliente"]').value = reserva.cliente;
		formReserva.querySelector('select[name="clase"]').value = reserva.clase;
		formReserva.querySelector('input[name="horario"]').value = reserva.horario;
		formReserva.querySelector('input[name="fecha"]').value = reserva.fecha;
		formReserva.querySelector('select[name="estado"]').value = reserva.estado;

		modalTitulo.textContent = 'Editar reserva';
		modalReserva.modal('show');
	}

	if (btnEliminar) {
		const id = parseInt(btnEliminar.getAttribute('data-id'), 10);
		const reserva = reservas.find(item => item.id === id);
		if (!reserva) return;

		if (confirm(`¿Eliminar la reserva de "${reserva.cliente}" (${reserva.clase})?`)) {
			reservas = reservas.filter(item => item.id !== id);
			renderTabla(buscador.value);
		}
	}
});

formReserva.addEventListener('submit', function (event) {
	event.preventDefault();

	const idValue = formReserva.querySelector('input[name="id"]').value;
	const cliente = formReserva.querySelector('input[name="cliente"]').value.trim();
	const clase = formReserva.querySelector('select[name="clase"]').value;
	const horario = formReserva.querySelector('input[name="horario"]').value;
	const fecha = formReserva.querySelector('input[name="fecha"]').value;
	const estado = formReserva.querySelector('select[name="estado"]').value;

	if (!cliente || !clase || !horario || !fecha || !estado) {
		alert('Por favor completa todos los campos.');
		return;
	}

	if (idValue) {
		const id = parseInt(idValue, 10);
		const reserva = reservas.find(item => item.id === id);
		if (reserva) {
			reserva.cliente = cliente;
			reserva.clase = clase;
			reserva.horario = horario;
			reserva.fecha = fecha;
			reserva.estado = estado;
		}
	} else {
		reservas.push({ id: siguienteId++, cliente, clase, horario, fecha, estado });
	}

	renderTabla(buscador.value);
	modalReserva.modal('hide');
});

buscador.addEventListener('input', function () { renderTabla(this.value); });

const tablaSolicitudesBody = document.getElementById('tablaSolicitudesBody');
const estadoVacioSolicitudes = document.getElementById('estadoVacioSolicitudes');
const buscadorSolicitudes = document.getElementById('buscadorSolicitudes');

function renderSolicitudes(filtro = '') {
	tablaSolicitudesBody.innerHTML = '';

	const filtroLower = filtro.trim().toLowerCase();
	const listaFiltrada = solicitudes.filter(function (solicitud) {
		return solicitud.cliente.toLowerCase().includes(filtroLower) ||
			solicitud.clase.toLowerCase().includes(filtroLower);
	});

	estadoVacioSolicitudes.style.display = listaFiltrada.length === 0 ? 'block' : 'none';

	listaFiltrada.forEach(function (solicitud) {
		const fila = document.createElement('tr');
		fila.innerHTML = `
			<td>${solicitud.id}</td>
			<td>${solicitud.cliente}</td>
			<td>${solicitud.clase}</td>
			<td>${solicitud.horario}</td>
			<td>${solicitud.fecha}</td>
			<td>
				<button type="button" class="btn-admin-outline approve" data-id="${solicitud.id}">Aprobar</button>
				<button type="button" class="btn-admin-outline" data-id="${solicitud.id}">Rechazar</button>
			</td>
		`;
		tablaSolicitudesBody.appendChild(fila);
	});
}

tablaSolicitudesBody.addEventListener('click', function (event) {
	const btnAprobar = event.target.closest('.btn-admin-outline.approve');
	const btnRechazar = event.target.closest('.btn-admin-outline:not(.approve)');

	if (btnAprobar) {
		const id = parseInt(btnAprobar.getAttribute('data-id'), 10);
		const solicitud = solicitudes.find(item => item.id === id);
		if (!solicitud) return;

		reservas.push({
			id: siguienteId++,
			cliente: solicitud.cliente,
			clase: solicitud.clase,
			horario: solicitud.horario,
			fecha: solicitud.fecha,
			estado: 'Confirmada'
		});

		solicitudes = solicitudes.filter(item => item.id !== id);
		renderSolicitudes(buscadorSolicitudes.value);
		renderTabla(buscador.value);
	}

	if (btnRechazar) {
		const id = parseInt(btnRechazar.getAttribute('data-id'), 10);
		const solicitud = solicitudes.find(item => item.id === id);
		if (!solicitud) return;

		if (confirm(`¿Rechazar la solicitud de "${solicitud.cliente}"?`)) {
			solicitudes = solicitudes.filter(item => item.id !== id);
			renderSolicitudes(buscadorSolicitudes.value);
		}
	}
});

buscadorSolicitudes.addEventListener('input', function () { renderSolicitudes(this.value); });

renderTabla();
renderSolicitudes();
