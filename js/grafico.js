const totalOpiniones = document.getElementById('totalOpiniones');
const promedioOpiniones = document.getElementById('promedioOpiniones');
const estrellasPromedio = document.getElementById('estrellasPromedio');
const graficoTorta = document.getElementById('graficoTorta');
const leyendaCalificaciones = document.getElementById('leyendaCalificaciones');
const sinOpiniones = document.getElementById('sinOpiniones');
const errorGrafico = document.getElementById('errorGrafico');
const actualizarGrafico = document.getElementById('actualizarGrafico');
const svgNamespace = 'http://www.w3.org/2000/svg';
const coloresCalificacion = ['#d86b63', '#e88244', '#e4a93b', '#8ba94b', '#398d2c'];

function crearElementoSvg(nombre, atributos, texto) {
	const elemento = document.createElementNS(svgNamespace, nombre);
	Object.entries(atributos).forEach(function ([atributo, valor]) {
		elemento.setAttribute(atributo, valor);
	});
	if (texto !== undefined) elemento.textContent = texto;
	return elemento;
}

function renderGraficoTorta(calificaciones, total, promedio) {
	graficoTorta.replaceChildren();
	sinOpiniones.hidden = total > 0;
	if (!total) return;

	const radio = 62;
	const circunferencia = 2 * Math.PI * radio;
	let desplazamiento = 0;
	const svg = crearElementoSvg('svg', {
		'class': 'pie-chart',
		'viewBox': '0 0 220 190',
		'role': 'img',
		'aria-label': 'Distribución de calificaciones de una a cinco estrellas'
	});
	svg.appendChild(crearElementoSvg('title', {}, 'Distribución de calificaciones de 1 a 5 estrellas'));
	svg.appendChild(crearElementoSvg('circle', {
		'cx': '95', 'cy': '90', 'r': String(radio), 'class': 'pie-chart-track'
	}));

	calificaciones.forEach(function (cantidad, indice) {
		if (cantidad <= 0) return;
		const longitud = circunferencia * cantidad / total;
		svg.appendChild(crearElementoSvg('circle', {
			'cx': '95',
			'cy': '90',
			'r': String(radio),
			'class': 'pie-chart-segment',
			'stroke': coloresCalificacion[indice],
			'stroke-dasharray': `${longitud} ${circunferencia - longitud}`,
			'stroke-dashoffset': String(-desplazamiento),
			'transform': 'rotate(-90 95 90)'
		}));
		desplazamiento += longitud;
	});

	svg.appendChild(crearElementoSvg('text', { x: '95', y: '88', 'text-anchor': 'middle', 'class': 'pie-chart-average' }, promedio.toFixed(1)));
	svg.appendChild(crearElementoSvg('text', { x: '95', y: '108', 'text-anchor': 'middle', 'class': 'pie-chart-caption' }, 'de 5 estrellas'));
	graficoTorta.appendChild(svg);
}

function renderLeyenda(calificaciones, total) {
	leyendaCalificaciones.replaceChildren();
	calificaciones.forEach(function (cantidad, indice) {
		const porcentaje = total ? Math.round(cantidad / total * 100) : 0;
		const elemento = document.createElement('li');
		elemento.className = 'rating-legend-item';
		const muestra = document.createElement('span');
		muestra.className = 'rating-legend-swatch';
		muestra.style.backgroundColor = coloresCalificacion[indice];
		muestra.setAttribute('aria-hidden', 'true');
		const texto = document.createElement('span');
		texto.className = 'rating-legend-label';
		texto.textContent = `${indice + 1} ${indice === 0 ? 'estrella' : 'estrellas'}`;
		const valor = document.createElement('strong');
		valor.textContent = `${cantidad} (${porcentaje}%)`;
		elemento.append(muestra, texto, valor);
		leyendaCalificaciones.appendChild(elemento);
	});
}

async function cargarGrafico() {
	actualizarGrafico.disabled = true;
	errorGrafico.hidden = true;
	try {
		const respuesta = await fetch('php/opiniones.php');
		const resultado = await respuesta.json();
		if (!respuesta.ok || !resultado.ok) {
			throw new Error(resultado.mensaje || 'No se pudieron cargar las opiniones.');
		}

		const total = resultado.total || 0;
		const promedio = resultado.promedio || 0;
		const calificaciones = resultado.calificaciones || [0, 0, 0, 0, 0];
		totalOpiniones.textContent = String(total);
		promedioOpiniones.textContent = `${promedio.toFixed(1)} / 5`;
		estrellasPromedio.textContent = `${'★'.repeat(Math.round(promedio))}${'☆'.repeat(5 - Math.round(promedio))}`;
		renderGraficoTorta(calificaciones, total, promedio);
		renderLeyenda(calificaciones, total);
	} catch (error) {
		errorGrafico.textContent = error.message || 'Ocurrió un error al cargar las opiniones.';
		errorGrafico.hidden = false;
	} finally {
		actualizarGrafico.disabled = false;
	}
}

actualizarGrafico.addEventListener('click', cargarGrafico);
cargarGrafico();