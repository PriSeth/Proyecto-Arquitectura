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

function claseInfo(nombreClase) {
	const mapa = {
		Zumba: { tipo: 'Cardio', duracion: '45 min' },
		Spinning: { tipo: 'Cardio', duracion: '50 min' },
		Yoga: { tipo: 'Flexibilidad', duracion: '60 min' },
		Funcional: { tipo: 'Fuerza', duracion: '50 min' },
		Pilates: { tipo: 'Core', duracion: '45 min' }
	};

	return mapa[nombreClase] || { tipo: 'Clase', duracion: '45 min' };
}

function ordenarReservas(reservas) {
	return reservas
		.filter(reserva => reserva.estado !== 'Cancelada')
		.sort(function (a, b) {
			const fechaHoraA = new Date(`${a.fecha}T${a.horario}`);
			const fechaHoraB = new Date(`${b.fecha}T${b.horario}`);

			if (a.estado === 'Confirmada' && b.estado !== 'Confirmada') return -1;
			if (a.estado !== 'Confirmada' && b.estado === 'Confirmada') return 1;
			return fechaHoraA - fechaHoraB;
		});
}

async function confirmarReserva(idReserva) {
	const respuesta = await fetch('php/reservas.php', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ id_reserva: idReserva, estado: 'Confirmada' })
	});
	const resultado = await respuesta.json();
	if (!respuesta.ok || !resultado.ok) {
		throw new Error(resultado.mensaje || 'No se pudo confirmar la reserva.');
	}
	window.alert('La clase ha sido confirmada.');
	await cargarPanel();
}

async function cancelarReserva(idReserva) {
	const respuesta = await fetch('php/reservas.php', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ id_reserva: idReserva })
	});
	const resultado = await respuesta.json();
	if (!respuesta.ok || !resultado.ok) {
		throw new Error(resultado.mensaje || 'No se pudo cancelar la reserva.');
	}
	window.alert('La clase ha sido cancelada.');
	await cargarPanel();
}

function mostrarProximaClase(reserva) {
	if (!reserva) {
		nextClass.textContent = 'Aún no tienes clases reservadas.';
		return;
	}

	const detalleProxima = claseInfo(reserva.clase);
	nextClass.innerHTML = `
		<div style="display:flex; flex-direction:column; gap:8px;">
			<strong class="next-class-name" style="font-size:1.1rem;">${escaparHtml(reserva.clase)}</strong>
			<span class="next-class-detail"><i class="fa fa-clock-o" aria-hidden="true"></i> ${escaparHtml(reserva.fecha)} a las ${escaparHtml(reserva.horario)}</span>
			<span class="next-class-detail"><i class="fa fa-clock-o" aria-hidden="true"></i> ${escaparHtml(detalleProxima.duracion)}</span>
			<span class="next-class-detail"><i class="fa fa-tags" aria-hidden="true"></i> ${escaparHtml(detalleProxima.tipo)}</span>
		</div>
	`;
}

function mostrarReservas(reservas) {
	const activas = ordenarReservas(reservas);
	const pendientes = activas.filter(reserva => reserva.estado === 'Pendiente');
	const proxima = activas[0] || null;
	reservationSummary.innerHTML = '';

	if (!pendientes.length) {
		reservationSummary.textContent = 'No tienes reservas activas.';
	} else {
		reservationSummary.innerHTML = pendientes.map(function (reserva) {
			const detalleClase = claseInfo(reserva.clase);
			return `
				<div style="display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid #e5e7eb; padding:8px 0;">
					<div>
						<strong style="display:block; font-size:0.96rem; color:#17324d;">${escaparHtml(reserva.clase)}</strong>
						<span style="display:block; font-size:0.8rem; color:#5a6472;">${escaparHtml(reserva.fecha)} · ${escaparHtml(reserva.horario)}</span>
						<span style="display:block; margin-top:4px; font-size:0.72rem; color:#4f46e5; font-weight:600;">${escaparHtml(detalleClase.tipo)} · ${escaparHtml(detalleClase.duracion)}</span>
						<span style="display:inline-block; margin-top:4px; font-size:0.72rem; color:#4f46e5; font-weight:600;">${escaparHtml(reserva.estado)}</span>
					</div>
					<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
						<button type="button" data-confirmar="${escaparHtml(reserva.id_reserva)}" style="padding:6px 10px; border-radius:8px; border:1px solid #1f9d6d; background:#1f9d6d; color:#fff; font-size:0.75rem; cursor:pointer;">Confirmar</button>
						<button type="button" data-cancelar="${escaparHtml(reserva.id_reserva)}" style="padding:6px 10px; border-radius:8px; border:1px solid #d9534f; background:#d9534f; color:#fff; font-size:0.75rem; cursor:pointer;">Cancelar</button>
					</div>
				</div>
			`;
		}).join('');
	}

	mostrarProximaClase(proxima);
}

reservationSummary.addEventListener('click', async function (event) {
	const confirmarBtn = event.target.closest('[data-confirmar]');
	const cancelarBtn = event.target.closest('[data-cancelar]');
	if (!confirmarBtn && !cancelarBtn) return;

	const idReserva = (confirmarBtn || cancelarBtn).getAttribute(confirmarBtn ? 'data-confirmar' : 'data-cancelar');

	try {
		if (confirmarBtn) {
			await confirmarReserva(idReserva);
		}
		if (cancelarBtn) {
			await cancelarReserva(idReserva);
		}
	} catch (error) {
		alert(error.message);
	}
});

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

	if (usuarioRespuesta.status === 401 || reservasRespuesta.status === 401 || clasesRespuesta.status === 401) {
		window.location.href = 'index.html';
		return;
	}

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
