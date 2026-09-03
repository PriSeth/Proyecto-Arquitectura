const carrusel = document.getElementById('inicioCarrusel');
const imagenCarrusel = document.getElementById('imagenCarrusel');
const botonAnterior = document.getElementById('carruselAnterior');
const botonSiguiente = document.getElementById('carruselSiguiente');

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

function mostrarImagen(indice, direccion) {
	indiceActual = (indice + imagenes.length) % imagenes.length;
	carrusel.classList.remove('slide-left', 'slide-right');
	void carrusel.offsetWidth;
	carrusel.classList.add(direccion === 'anterior' ? 'slide-left' : 'slide-right');
	imagenCarrusel.src = imagenes[indiceActual].src;
	imagenCarrusel.alt = imagenes[indiceActual].alt;
}

function reiniciarTemporizador() {
	clearInterval(temporizador);
	temporizador = setInterval(function () {
		mostrarImagen(indiceActual + 1, 'siguiente');
	}, 5000);
}

botonAnterior.addEventListener('click', function () {
	mostrarImagen(indiceActual - 1, 'anterior');
	reiniciarTemporizador();
});

botonSiguiente.addEventListener('click', function () {
	mostrarImagen(indiceActual + 1, 'siguiente');
	reiniciarTemporizador();
});

reiniciarTemporizador();
