function loadheader()
{
	displayError('');
	fetch('/header/')
	.then(response => {
		if (!response.ok) {
			throw new Error('Error network response');
		}
		return response.text();
	})
	.then(data => {
		if (document.getElementById('header-placeholder'))
		{
			document.getElementById('header-placeholder').innerHTML = data;
			const navLinks = document.querySelectorAll('.btn-header');

			const currentPath = window.location.pathname;
			
			navLinks.forEach(link => {
				if (link.getAttribute('href') === currentPath) {
					link.classList.add('active');
				}
			});
			loadscript('logout.js', () => logoutSession());
		}
	})
	.catch(error => {
		console.error('There has been a problem with your fetch operation:', error);
	});
}

function loadMiniChat()
{
	displayError('');
	fetch('/mini_chat/')
	.then(response => {
		if (!response.ok) {
			throw new Error('Error network response');
		}
		return response.text();
	})
	.then(data => {
		if (document.getElementById('chat-placeholder')) {
			document.getElementById('chat-placeholder').innerHTML = data;
			loadscript('chat.js', () => handleChat());
		}
	})
	.catch(error => {
		console.error('There has been a problem with your fetch operation:', error);
	});
}
