const nombreUsuario = document.getElementById('nombreUsuario');
const nextClass = document.getElementById('nextClass');
const reservationSummary = document.getElementById('reservationSummary');
const availableClasses = document.getElementById('availableClasses');

function escaparHtml(valor) {
	return String(valor).replace(/[&<>'"]/g, function (caracter) {
		const entidades = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
		return entidades[caracter];
	});
}

function fechaHoy() {
	const fecha = new Date();
	const mes = String(fecha.getMonth() + 1).padStart(2, '0');
	const dia = String(fecha.getDate()).padStart(2, '0');
	return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function ordenarReservas(reservas) {
	return reservas
		.filter(reserva => reserva.estado !== 'Cancelada')
		.sort(function (a, b) {
			return `${a.fecha} ${a.horario}`.localeCompare(`${b.fecha} ${b.horario}`);
		});
}

function mostrarReservas(reservas) {
	const activas = ordenarReservas(reservas);
	reservationSummary.textContent = activas.length
		? `${activas.length} ${activas.length === 1 ? 'reserva activa' : 'reservas activas'}.`
		: 'No tienes reservas activas.';

	if (!activas.length) {
		nextClass.textContent = 'Aún no tienes clases reservadas.';
		return;
	}

	const proxima = activas[0];
	nextClass.innerHTML = `
		<strong class="next-class-name">${escaparHtml(proxima.clase)}</strong>
		<span class="next-class-detail"><i class="fa fa-clock-o" aria-hidden="true"></i> ${escaparHtml(proxima.fecha)} a las ${escaparHtml(proxima.horario)}</span>
	`;
}

function mostrarClases(clases) {
	if (!clases.length) {
		availableClasses.innerHTML = '<li class="card-empty">No hay clases disponibles hoy.</li>';
		return;
	}

	availableClasses.innerHTML = clases.slice(0, 5).map(function (clase) {
		return `
			<li>
				<span><span class="class-time">${escaparHtml(clase.horario)}</span>${escaparHtml(clase.nombre_clase)}</span>
				<button type="button" data-reservar="${escaparHtml(clase.id_clase)}">Reservar</button>
			</li>
		`;
	}).join('');
}

async function cargarPanel() {
	const [usuarioRespuesta, reservasRespuesta, clasesRespuesta] = await Promise.all([
		fetch('php/usuario_actual.php'),
		fetch('php/reservas.php'),
		fetch(`php/clases_disponibles.php?fecha=${fechaHoy()}`)
	]);

	const usuarioResultado = await usuarioRespuesta.json();
	const reservasResultado = await reservasRespuesta.json();
	const clasesResultado = await clasesRespuesta.json();

	if (usuarioRespuesta.ok && usuarioResultado.ok) {
		nombreUsuario.textContent = usuarioResultado.usuario.usuario;
	}
	if (reservasRespuesta.ok && reservasResultado.ok) {
		mostrarReservas(reservasResultado.reservas);
	} else {
		reservationSummary.textContent = 'No se pudieron cargar tus reservas.';
	}
	if (clasesRespuesta.ok && clasesResultado.ok) {
		mostrarClases(clasesResultado.clases);
	} else {
		availableClasses.innerHTML = '<li class="card-empty">No se pudieron cargar las clases.</li>';
	}
}

availableClasses.addEventListener('click', function (event) {
	const boton = event.target.closest('[data-reservar]');
	if (boton) {
		window.location.href = `admin-reservas.html?clase=${encodeURIComponent(boton.dataset.reservar)}`;
	}
});

cargarPanel().catch(function () {
	reservationSummary.textContent = 'Inicia sesión para ver tus reservas.';
	availableClasses.innerHTML = '<li class="card-empty">Inicia sesión para ver las clases.</li>';
});
