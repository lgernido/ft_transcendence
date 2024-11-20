function logoutUser() {
    const csrfToken = getCookie('csrftoken');

    fetch('/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => {
        if (response.ok) {
            loadConnectPage();
            window.location.reload(true);
        } else {
            console.error('Erreur lors de la déconnexion');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la déconnexion :', error);
    });
}

function logoutSession() {
	const logoutButton = document.getElementById('logoutButton');
	
	logoutButton.addEventListener('click', function() {
		logoutUser();
	});
}