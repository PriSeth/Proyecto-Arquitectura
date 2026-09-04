function calcular(event) {
    event.preventDefault();

    const inputPeso = document.getElementById('peso');
    const inputAltura = document.getElementById('altura');
    const inputDuracion = document.getElementById('duracion');
    const resultado = document.getElementById('resultado');

    const parseNumero = (valor) => parseFloat(valor.replace(',', '.'));

    const peso = parseNumero(inputPeso.value);
    const alturaCm = parseNumero(inputAltura.value);
    const duracion = parseNumero(inputDuracion.value);

    const esValido =
        !isNaN(peso) && !isNaN(alturaCm) && !isNaN(duracion) &&
        peso > 0 && peso < 500 &&
        alturaCm > 0 && alturaCm < 300 &&
        duracion > 0 && duracion < 1440;

    if (!esValido) {
        resultado.innerHTML = `<p>Completa todos los campos correctamente.</p>`;
        return;
    }

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);

    let clasificacion, clase;
    if (imc < 18.5) {
        clasificacion = 'Bajo peso';
        clase = 'bajo';
    } else if (imc < 25) {
        clasificacion = 'Peso normal';
        clase = 'normal';
    } else if (imc < 30) {
        clasificacion = 'Sobrepeso';
        clase = 'sobre';
    } else {
        clasificacion = 'Obesidad';
        clase = 'obeso';
    }

    const calorias = (6.0 * peso * (duracion / 60)).toFixed(0);

    // Muestro también los datos ingresados, para que quede como referencia
    resultado.innerHTML = `
        <h3>Resultados</h3>
        <p>
            <strong>IMC:</strong>
            ${imc.toFixed(1)}
            <span class="${clase}">(${clasificacion})</span>
        </p>
        <p>
            <strong>Calorías estimadas:</strong>
            ${calorias} kcal
        </p>
        <p class="detalle">
            Con ${peso} kg, ${alturaCm} cm y ${duracion} min de actividad.
        </p>
    `;
    resultado.setAttribute('aria-live', 'polite');
}