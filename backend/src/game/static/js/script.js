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

function checkScriptPresence(src) {
    src = "/static/js/" + src;
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (!existingScript) {
        return (false);
    } else {
        return (true);
    }
}

function loadscript(file, func) {
    if (!checkScriptPresence(file)) {
        const script = document.createElement('script');
        script.src = "/static/js/" + file;
        document.body.appendChild(script);
        script.onload = () => {
            func();
        }
    }
    else {
        if (func) {
            func();
        }
    }
}

function loadConnectPage() {
    const appDiv = document.getElementById('app');
    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                fetch('/connect/')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(html => {
                        appDiv.innerHTML = html;
                        
                        if (history.state?.page !== 'connect') {
                            const state = { page: 'connect' };
                            history.pushState(state, '', "/connect");
                        }
                        loadscript('valid_login.js', () => ValidConnection());
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
            }
            else {
                loadMyPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
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

            if (history.state?.page !== 'create_account') {
                const state = { page: 'create_account' };
                history.pushState(state, '', "/create_account");
            }
            loadscript('create_account.js', () => ValidFormCreateAccount());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadMyPage() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');

    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                fetch('/mypage/', {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': csrfToken
                    }
                })
                .then(response => response.text())
                .then(html => {
                    appDiv.innerHTML = html;
                    
                    if (history.state?.page !== 'mypage') {
                        const state = { page: 'mypage' };
                        history.pushState(state, '', "/mypage");
                    }
                    loadscript('loadelement.js', () => loadchat());
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de mypage :', error);
                });
            }
            else {
                loadConnectPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
        });
}

function loadStats() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');

    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
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

                    if (history.state?.page !== 'stats') {
                        const state = { page: 'stats' };
                        history.pushState(state, '', "/stats");
                    }
                    loadscript('camenbert.js', () => drawCamembert());
                    loadscript('loadelement.js', () => loadchat());
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            }
            else {
                loadConnectPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
        });
}

function loadFriends() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
     
    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
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

                    if (history.state?.page !== 'amis') {
                        const state = { page: 'amis' };
                        history.pushState(state, '', "/amis");
                    }
                    loadscript('loadelement.js', () => loadchat());
                    loadscript('amis.js', () => loadFriendsList());
                    loadscript('amis.js', () => get_users());
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            }
            else {
                loadConnectPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
        });
}

function loadAccount() {
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    
    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
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

                    if (history.state?.page !== 'compte') {
                        const state = { page: 'compte' };
                        history.pushState(state, '', "/compte");
                    }
                    loadscript('compte.js', () => validChanges());
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            }
            else {
                loadConnectPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
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

            if (history.state?.page !== 'lobby_T') {
                const state = { page: 'lobby_T' };
                history.pushState(state, '', "/lobby_T");
            }
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

            if (history.state?.page !== 'lobby_Pu') {
                const state = { page: 'lobby_Pu' };
                history.pushState(state, '', "/lobby_Pu");
            }
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

            if (history.state?.page !== 'lobby_Pr') {
                const state = { page: 'lobby_Pr' };
                history.pushState(state, '', "/lobby_Pr");
            }
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

            if (history.state?.page !== 'game') {
                const state = { page: 'game' };
                history.pushState(state, '', "/game");
            }
            loadscript('loadelement.js', () => loadchat());
            loadscript('game.js', () => lauchgame());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('popstate', function(event) {
        if (event.state) {
            const pageType = event.state.page;

            if (pageType === 'mypage') {
                loadMyPage();
            }
            else if (pageType === 'stats') {
                loadStats();
            }
            else if (pageType === 'game') {
                loadGame();
            }
            else if (pageType === 'lobby_Pr') {
                loadPrivate();
            }
            else if (pageType === 'lobby_Pu') {
                loadPublic();
            }
            else if (pageType === 'lobby_T') {
                loadTournament();
            }
            else if (pageType === 'compte') {
                loadAccount();
            }
            else if (pageType === 'amis') {
                loadFriends();
            }
            else if (pageType === 'create_account') {
                loadCreateAccount();
            }
            else if (pageType === 'connect') {
                loadConnectPage();
            }
            else {
                console.log("Page not found", pageType);
                loadMyPage();
            }
        } 
        else {
            console.log("page not found");
            loadConnectPage();
        }
    });
});

document.addEventListener('DOMContentLoaded', loadConnectPage);

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener("keydown", function(event) {
        if (event.key === "F5") {
            event.preventDefault();
            const path = window.location.pathname;
            const lastPart = path.split('/').filter(Boolean).pop();

            console.log("Refresh page");
            if (lastPart === 'mypage') {
                loadMyPage();
            }
            else if (lastPart === 'stats') {
                loadStats();
            }
            else if (lastPart === 'game') {
                loadGame();
            }
            else if (lastPart === 'lobby_Pr') {
                loadPrivate();
            }
            else if (lastPart === 'lobby_Pu') {
                loadPublic();
            }
            else if (lastPart === 'lobby_T') {
                loadTournament();
            }
            else if (lastPart === 'compte') {
                loadAccount();
            }
            else if (lastPart === 'amis') {
                loadFriends();
            }
            else if (lastPart === 'create_account') {
                loadCreateAccount();
            }
            else if (lastPart === 'connect') {
                loadConnectPage();
            }
            else {
                console.log("Page not found", lastPart);
                loadConnectPage();
            }
        }
    });
});

window.addEventListener('load', function () {
    const initialPage = window.location.pathname.split('/').pop() || 'connect';
    const initialState = { page: initialPage };
    history.replaceState(initialState, '', window.location.pathname);
});

