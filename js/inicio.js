const carrusel = document.getElementById('inicioCarrusel');
const imagenCarrusel = document.getElementById('imagenCarrusel');
const botonAnterior = document.getElementById('carruselAnterior');
const botonSiguiente = document.getElementById('carruselSiguiente');
const indicadores = document.getElementById('carruselIndicadores');

const imagenes = [
	{ src: 'images/fuerza.png', alt: 'Entrenamiento de fuerza' },
	{ src: 'images/funcional.png', alt: 'Entrenamiento funcional' },
	{ src: 'images/pesas.png', alt: 'Entrenamiento con pesas' },
	{ src: 'images/pilates.png', alt: 'Clase de Pilates' },
	{ src: 'images/running.jpg', alt: 'Entrenamiento de running' },
	{ src: 'images/spinning.png', alt: 'Clase de spinning' },
	{ src: 'images/yoga.png', alt: 'Clase de yoga' },
	{ src: 'images/zumba.png', alt: 'Clase de zumba' }
];

let indiceActual = 0;
let temporizador;

imagenes.forEach(function (imagen, indice) {
	const indicador = document.createElement('button');
	indicador.type = 'button';
	indicador.className = 'carrusel-indicador';
	indicador.setAttribute('aria-label', `Mostrar imagen ${indice + 1}: ${imagen.alt}`);
	indicador.addEventListener('click', function () {
		mostrarImagen(indice, indice >= indiceActual ? 'siguiente' : 'anterior');
		reiniciarTemporizador();
	});
	indicadores.appendChild(indicador);
});

function mostrarImagen(indice, direccion) {
	indiceActual = (indice + imagenes.length) % imagenes.length;
	carrusel.classList.remove('slide-left', 'slide-right');
	void carrusel.offsetWidth;
	carrusel.classList.add(direccion === 'anterior' ? 'slide-left' : 'slide-right');
	imagenCarrusel.src = imagenes[indiceActual].src;
	imagenCarrusel.alt = imagenes[indiceActual].alt;
	indicadores.querySelectorAll('.carrusel-indicador').forEach(function (indicador, indiceIndicador) {
		const activo = indiceIndicador === indiceActual;
		indicador.classList.toggle('activo', activo);
		indicador.setAttribute('aria-current', activo ? 'true' : 'false');
	});
}

function reiniciarTemporizador() {
	clearInterval(temporizador);
	temporizador = setInterval(function () {
		mostrarImagen(indiceActual + 1, 'siguiente');
	}, 3000);
}

botonAnterior.addEventListener('click', function () {
	mostrarImagen(indiceActual - 1, 'anterior');
	reiniciarTemporizador();
});

botonSiguiente.addEventListener('click', function () {
	mostrarImagen(indiceActual + 1, 'siguiente');
	reiniciarTemporizador();
});

mostrarImagen(indiceActual, 'siguiente');
reiniciarTemporizador();
