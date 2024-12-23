function logoutUser() {
    const csrfToken = getCookie('csrftoken');

    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  // Important pour envoyer les cookies
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
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
                        closeAllOpenWebSocket();
                        stopAllIntervals();
                    } else {
                        console.error('Erreur lors de la déconnexion');
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la déconnexion :', error);
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
        });
}

function logoutSession() {
	const logoutButton = document.getElementById('logoutButton');
	
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            logoutUser();
        });
    }
}

function closeAllOpenWebSocket()
{
    if (chatSocket) { chatSocket.close(); }
    if (presenceOnline) { presenceOnline.close() };
    if (socket_roomP) { socket_roomP.close()};
}