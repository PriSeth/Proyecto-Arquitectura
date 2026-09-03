const userMenuToggle = document.getElementById('userMenuToggle');
const userMenu = document.getElementById('userMenu');

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
