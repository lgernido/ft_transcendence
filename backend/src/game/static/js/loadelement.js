/* permet d'inserer le header dans toutes les pages et de mettre en place le system de selection active */
function loadheader()
{
	fetch('/header/')
	.then(response => {
		if (!response.ok) {
			throw new Error('Error network response');
		}
		return response.text();
	})
	.then(data => {
		document.getElementById('header-placeholder').innerHTML = data;
		const navLinks = document.querySelectorAll('.btn-header');

		const currentPath = window.location.pathname;
		
		navLinks.forEach(link => {
			if (link.getAttribute('href') === currentPath) {
				link.classList.add('active');
			}
		});
	})
	.catch(error => {
		console.error('There has been a problem with your fetch operation:', error);
	});
}

/* permet d'inserer la page chat.html dans toutes les pages */
function loadchat()
{
	fetch('/chat/')
	.then(response => {
		if (!response.ok) {
			throw new Error('Error network response');
		}
		return response.text();
	})
	.then(data => {
		document.getElementById('chat-placeholder').innerHTML = data;
	})
	.catch(error => {
		console.error('There has been a problem with your fetch operation:', error);
	});
}
