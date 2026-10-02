const opinionPromedio = document.getElementById('opinionPromedio');
const opinionEstrellas = document.getElementById('opinionEstrellas');
const opinionesTotal = document.getElementById('opinionesTotal');
const opinionesAleatorias = document.getElementById('opinionesAleatorias');
const errorOpiniones = document.getElementById('errorOpiniones');

function crearResena(opinion) {
	const articulo = document.createElement('article');
	articulo.className = 'review-item';

	const cabecera = document.createElement('div');
	cabecera.className = 'review-meta';
	const nombre = document.createElement('strong');
	nombre.className = 'review-name';
	nombre.textContent = opinion.nombre;
	const estrellas = document.createElement('span');
	estrellas.className = 'review-stars';
	estrellas.textContent = `${'★'.repeat(Number(opinion.calificacion))}${'☆'.repeat(5 - Number(opinion.calificacion))}`;
	estrellas.setAttribute('aria-label', `${opinion.calificacion} de 5 estrellas`);
	cabecera.append(nombre, estrellas);

	const comentario = document.createElement('p');
	comentario.className = 'review-comment';
	comentario.textContent = opinion.comentario;
	articulo.append(cabecera, comentario);
	return articulo;
}

async function cargarOpiniones() {
	try {
		const respuesta = await fetch('php/opiniones.php');
		const resultado = await respuesta.json();
		if (!respuesta.ok || !resultado.ok) {
			throw new Error(resultado.mensaje || 'No se pudieron cargar las opiniones.');
		}

		const promedio = resultado.promedio || 0;
		const total = resultado.total || 0;
		opinionPromedio.textContent = `${promedio.toFixed(1)} / 5`;
		opinionEstrellas.textContent = `${'★'.repeat(Math.round(promedio))}${'☆'.repeat(5 - Math.round(promedio))}`;
		opinionesTotal.textContent = String(total);
		opinionesAleatorias.replaceChildren();

		if (!resultado.opiniones.length) {
			const vacio = document.createElement('p');
			vacio.className = 'reviews-empty';
			vacio.textContent = 'Aún no hay opiniones publicadas.';
			opinionesAleatorias.appendChild(vacio);
			return;
		}

		resultado.opiniones.forEach(function (opinion) {
			opinionesAleatorias.appendChild(crearResena(opinion));
		});
	} catch (error) {
		opinionesAleatorias.replaceChildren();
		errorOpiniones.textContent = error.message || 'Ocurrió un error al cargar las opiniones.';
		errorOpiniones.hidden = false;
	}
}

cargarOpiniones();