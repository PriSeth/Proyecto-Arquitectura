const userMenuToggle = document.getElementById('userMenuToggle');
const userMenu = document.getElementById('userMenu');
const logoutLink = document.getElementById('logoutLink');
const enlacesAdministracion = document.querySelectorAll('a[href="lista-Usuarios.html"], a[href="gestion-usuario.html"]');

enlacesAdministracion.forEach(function (enlace) {
	enlace.hidden = true;
	enlace.style.display = 'none';
});

fetch('php/usuario_actual.php')
	.then(function (respuesta) {
		if (!respuesta.ok) {
			throw new Error('Sesión no iniciada');
		}
		return respuesta.json();
	})
	.then(function (resultado) {
		const nombreUsuario = document.getElementById('nombreUsuario');
		if (nombreUsuario) {
			nombreUsuario.textContent = resultado.usuario.usuario;
		}

		const esAdmin = resultado.usuario.rol === 'admin';
		enlacesAdministracion.forEach(function (enlace) {
			enlace.hidden = !esAdmin;
				enlace.style.display = esAdmin ? '' : 'none';
		});

		const paginaActual = window.location.pathname.split('/').pop();
		if (!esAdmin && (paginaActual === 'lista-Usuarios.html' || paginaActual === 'gestion-usuario.html')) {
			window.location.href = 'inicio.html';
		}
	})
	.catch(function () {
		if (enlacesAdministracion.length) {
			enlacesAdministracion.forEach(function (enlace) {
				enlace.hidden = true;
				enlace.style.display = 'none';
			});
		}

		if (window.location.pathname.endsWith('inicio.html') ||
			window.location.pathname.endsWith('admin-reservas.html') ||
			window.location.pathname.endsWith('MiPerfil.html') ||
			window.location.pathname.endsWith('lista-Usuarios.html') ||
			window.location.pathname.endsWith('gestion-usuario.html')) {
			window.location.href = 'index.html';
		}
	});

if (logoutLink) {
	logoutLink.addEventListener('click', function (event) {
		event.preventDefault();
		fetch('php/cerrar_sesion.php', { method: 'POST' })
			.finally(function () {
				window.location.href = 'index.html';
			});
	});
}

if (userMenuToggle && userMenu) {
	userMenuToggle.addEventListener('click', function () {
		const menuAbierto = userMenu.hidden;
		userMenu.hidden = !menuAbierto;
		userMenuToggle.setAttribute('aria-expanded', String(menuAbierto));
	});

	document.addEventListener('click', function (event) {
		if (!userMenu.contains(event.target) && !userMenuToggle.contains(event.target)) {
			userMenu.hidden = true;
			userMenuToggle.setAttribute('aria-expanded', 'false');
		}
	});
}

