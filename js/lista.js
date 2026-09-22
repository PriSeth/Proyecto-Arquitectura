const tablaUsuariosBody = document.getElementById('tablaUsuariosBody');
const estadoVacioUsuarios = document.getElementById('estadoVacioUsuarios');
const buscadorUsuarios = document.getElementById('buscadorUsuarios');

let usuarios = [];

function formatearFecha(fechaTexto){
    const fecha = new Date(fechaTexto.replace(' ', 'T'));
    if (isNaN(fecha)) return fechaTexto;
    return fecha.toLocaleDateString('es-CL');
}

function renderUsuarios(filtro = ''){
    tablaUsuariosBody.innerHTML = '';
    const filtroLower = filtro.trim().toLocaleLowerCase();

    const listaFiltrada = usuarios.filter(function (u){
       return u.nombre.toLowerCase().includes(filtroLower) ||
			u.rut.toLowerCase().includes(filtroLower) ||
			u.usuario.toLowerCase().includes(filtroLower);
	});

    estadoVacioUsuarios.style.display = listaFiltrada.length === 0 ? 'block' : 'none';

    listaFiltrada.forEach(function (u){
        const fila = document.createElement('tr');
        fila.innerHTML = `
			<td>${u.id_usuario}</td>
			<td>${u.nombre}</td>
			<td>${u.rut}</td>
			<td>${u.correo}</td>
			<td>${u.usuario}</td>
			<td>${u.telefono}</td>
			<td><span class="badge-estado ${u.rol === 'admin' ? 'badge-confirmada' : 'badge-pendiente'}">${u.rol}</span></td>
			<td>${formatearFecha(u.fecha_registro)}</td>
		`;
		tablaUsuariosBody.appendChild(fila);
	});
}

async function cargarUsuarios() {
    const respuesta = await fetch('php/usuarios.php');
    const resultado = await respuesta.json();
    if (respuesta.status === 403) {
        window.location.href = 'inicio.html';
        return;
    }
    if (!respuesta.ok  || !resultado.ok){
        throw new Error(resultado.mensaje || 'No se pudieron cargar los usuarios.');
    }
    usuarios = resultado.usuarios;
    renderUsuarios(buscadorUsuarios.value);
}

buscadorUsuarios.addEventListener('input', function (){
    renderUsuarios(this.value);
});

cargarUsuarios().catch(function (error) {
	alert(error.message);
});