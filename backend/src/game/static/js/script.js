// /* permet d'adapter la couleur du texte en fonction de ce qui est ecris */
// document.addEventListener('DOMContentLoaded', function() {
// 	const results = document.querySelectorAll('.result');

// 	results.forEach(result => {
// 		const text = result.textContent.trim();
// 		if (text === "Win") {
// 			result.classList.add('win-color');
// 		}
// 		else if (text === "Lose") {
// 			result.classList.add('lose-color');
// 		}
// 		else if (text === "Draw") {
// 			result.classList.add('draw-color');
// 		}
// 	});
// });

document.addEventListener('DOMContentLoaded', function () {
	const themeLinks = document.querySelectorAll('.dropdown-item-color');

	themeLinks.forEach(link => {
		link.addEventListener('click', function (event) {
			event.preventDefault();

			// Retirer les classes de thème existantes
			document.body.classList.remove('theme-default', 'theme-light', 'theme-dark');
			
			// Ajouter la nouvelle classe de thème sélectionnée
			const selectedTheme = this.getAttribute('data-theme');
			document.body.classList.add(`theme-${selectedTheme}`);
		});
	});

    loadheader();
});

function displayError(message) {
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
        if (message) {
            errorMessageElement.innerText = message;
            errorMessageElement.style.display = 'block';
        }
        else {
            errorMessageElement.style.display = 'none';
        }
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function loadscript(file, func) {
    const script = document.createElement('script');
    script.src = "/static/js/" + file;
    document.body.appendChild(script);
    script.onload = () => {
        func();
    }
}

function loadConnectPage() {
    const appDiv = document.getElementById('app');
    fetch('/connect/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;
            loadscript('valid_login.js', () => ValidConnection());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadCreateAccount() {
    const appDiv = document.getElementById('app');
    fetch('/create_account/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('create_account.js', () => ValidFormCreateAccount());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadMyPage() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken'); 

    fetch('/mypage/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.text())
    .then(html => {
        appDiv.innerHTML = html;

        loadscript('loadelement.js', () => loadchat());
    })
    .catch(error => {
        console.error('Erreur lors de la récupération de mypage :', error);
    });
}

function loadStats() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/stats/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('camenbert.js', () => drawCamembert());
            loadscript('loadelement.js', () => loadchat());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadFriends() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/amis/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('amis.js', () => loadFriendsList());
            loadscript('amis.js', () => get_users());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadAccount()
{
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/compte/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('compte.js', () => validChanges());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadTournament()
{
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/lobby_tournament/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('lobby_tournament.js', () => tournament());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPublic() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/lobby/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('lobby.js', () => lobby());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPrivate() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/lobby_private/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('lobby_private.js', () => lobby_private());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGame() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/game/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('game.js', () => lauchgame());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

document.addEventListener('DOMContentLoaded', loadConnectPage);

