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

                        const state = { page: 'connect' };
                        history.replaceState(state, '', "/connect");
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

            const state = { page: 'create_account' };
            history.replaceState(state, '', "/create_account");
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
                    
                    const state = { page: 'mypage' };
                    history.replaceState(state, '', "/mypage");
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

                    const state = { page: 'stats' };
                    history.replaceState(state, '', "/stats");
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

                    const state = { page: 'friends' };
                    history.replaceState(state, '', "/friends");
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

                    const state = { page: 'account' };
                    history.replaceState(state, '', "/account");
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

            const state = { page: 'lobby_T' };
            history.replaceState(state, '', "/lobby_T");
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

            const state = { page: 'lobby_Pu' };
            history.replaceState(state, '', "/lobby_Pu");
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

            const state = { page: 'lobby_Pr' };
            history.replaceState(state, '', "/lobby_Pr");
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

            const state = { page: 'game' };
            history.replaceState(state, '', "/game");
            loadscript('loadelement.js', () => loadchat());
            loadscript('game.js', () => lauchgame());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

window.addEventListener('popstate', function(event) {
    if (event.state) {
        const pageType = event.state.page;

        console.log(pageType);

        if (pageType === 'mypage')
        {
            console.log("Fleche: go my page");
            loadMyPage();
        }
        else if (pageType === 'stats')
        {
            console.log("Fleche: go stats");
            loadStats();
        }
        else if (pageType === 'game')
        {
            console.log("Fleche: go game");
            loadGame();
        }
        else if (pageType === 'lobby_Pr')
        {
            console.log("Fleche: go lobby pr");
            loadPrivate();
        }
        else if (pageType === 'lobby_Pu')
        {
            console.log("Fleche: go lobbt pu");
            loadPublic();
        }
        else if (pageType === 'lobby_T')
        {
            console.log("Fleche: go lobby T");
            loadTournament();
        }
        else if (pageType === 'account')
        {
            console.log("Fleche: go account");
            loadAccount();
        }
        else if (pageType === 'friends')
        {
            console.log("Fleche: go friends");
            loadFriends();
        }
        else if (pageType === 'create_account')
        {
            console.log("Fleche: go create account");
            loadCreateAccount();
        }
        else if (pageType === 'connect')
        {
            console.log("Fleche: go connect");
            loadConnectPage();
        }
    } 
    else {
        console.log("page not found");
        loadConnectPage();
    }
});

document.addEventListener('DOMContentLoaded', loadConnectPage);

window.addEventListener('load', function() {
    const initialState = { page: 'connect' };
    history.replaceState(initialState, '', window.location.pathname);
});

