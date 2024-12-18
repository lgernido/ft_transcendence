document.addEventListener('DOMContentLoaded', function () {
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
        console.log("load file and function", file, func);
        const script = document.createElement('script');
        script.src = "/static/js/" + file;
        document.body.appendChild(script);
        script.onload = () => {
            func();
        }
    }
    else {
        console.log("load function only", func);
        if (func) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', func);
            } else {
                func();
            }
        }
    }
}

function loadConnectPage() {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    
    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                fetch('/connect/', {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Fetch-Request': 'true',
                    }
                } )
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
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');

    fetch('/create_account/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Fetch-Request': 'true',
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
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');

    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                console.log("User connecte");
                fetch('/mypage/', {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Fetch-Request': 'true',
                    }
                })
                .then(response => response.text())
                .then(html => {
                    if (!appDiv)
                        console.log("app PAS present");
                    else
                        console.log("app present")
                    appDiv.innerHTML = html;
                    
                    if (history.state?.page !== 'mypage') {
                        const state = { page: 'mypage' };
                        history.pushState(state, '', "/mypage");
                    }
                    // loadscript('language-switch.js', () => selectLanguage());
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
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');

    console.log("loadstats");
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
                        'X-CSRFToken': csrfToken,
                        'X-Fetch-Request': 'true',
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
                    loadscript('camenbert.js', () => func_stats());
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            }
            else {
                console.log("User PAS connecte");
                loadConnectPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
        });
}

function loadFriends() {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');

    console.log("Enter loadfriends");
    
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
                        'X-CSRFToken': csrfToken,
                        'X-Fetch-Request': 'true',
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
                    console.log("Load function amis");
                    loadscript('amis.js', () => selectUser());
                    checkStatus();
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
    displayError('');
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
                        'X-CSRFToken': csrfToken,
                        'X-Fetch-Request': 'true',
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
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/lobby_tournament/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Fetch-Request': 'true',
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
            console.log("loadTournament");
            loadscript('lobby_tournament.js', () => tournament());
            loadscript('loadelement.js', () => loadMiniChat());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPublic() {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/lobby/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Fetch-Request': 'true',
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
            loadscript('lobby.js', () => lobby());
            loadscript('loadelement.js', () => loadMiniChat());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPrivate() {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch('/lobby_private/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Fetch-Request': 'true',
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
            loadscript('lobby_private.js', () => lobby_private());
            loadscript('loadelement.js', () => loadMiniChat());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGame(roomName, maxPoints) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/game/${roomName}`, {
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

            if (history.state?.page !== `game-${roomName}`) {
                const state = { page: `game-${roomName}` };
                history.pushState(state, '', `/game/${roomName}`);
            }
            // loadscript('loadelement.js', () => loadchat());
            loadscript('game.js', () => launchGameBot(roomName, maxPoints));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGamePrivateCustom(roomName, maxPoints) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/custom/${roomName}`, {
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

            if (history.state?.page !== `custom-${roomName}`) {
                const state = { page: `custom-${roomName}` };
                history.pushState(state, '', `/custom/${roomName}`);
            }
            // loadscript('loadelement.js', () => loadchat());
            loadscript('gameCustom.js', () => launchGamePrivateCustom(roomName, maxPoints));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGamePrivate(roomName, maxPoints) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/game/${roomName}`, {
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

            if (history.state?.page !== `game-${roomName}`) {
                const state = { page: `game-${roomName}` };
                history.pushState(state, '', `/game/${roomName}`);
            }
            // loadscript('loadelement.js', () => loadchat());
            loadscript('gamePrivate.js', () => launchGamePrivate(roomName, maxPoints));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGameTournament(roomName, maxPoints, players) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/tournament/${roomName}`, {
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

            if (history.state?.page !== `tournament-${roomName}`) {
                const state = { page: `tournament-${roomName}` };
                history.pushState(state, '', `/tournament/${roomName}`);
            }
            // loadscript('loadelement.js', () => loadchat());
            loadscript('tournament.js', () => launchTournament(roomName, maxPoints, players));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadChat() {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    
    fetch('/check_user_status/', {
        method: 'GET',
        credentials: 'same-origin'  
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                fetch('/chat/', {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Fetch-Request': 'true',
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

                    if (history.state?.page !== 'chat') {
                        const state = { page: 'chat' };
                        history.pushState(state, '', "/chat");
                    }
                    loadscript('chat.js', () => handleChat());
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

document.addEventListener('DOMContentLoaded', function () {
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const path = getQueryParam('next') || window.location.pathname;

    if (path === '/mypage/') {
        loadMyPage();
    }
    else if (path === '/stats/') {
        loadStats();
    }
    else if (path === '/game/') {
        loadGame();
    }
    else if (path === '/lobby_Pr/') {
        loadPrivate();
    }
    else if (path === '/lobby_Pu/') {
        loadPublic();
    }
    else if (path === '/lobby_T/') {
        loadTournament();
    }
    else if (path === '/compte/') {
        loadAccount();
    }
    else if (path === '/amis/') {
        loadFriends();
    }
    else if (path === '/create_account/') {
        loadCreateAccount();
    }
    else if (path === '/connect/') {
        loadConnectPage();
    }
    else if (path === '/chat/') {
        loadChat();
    }
    else {
        console.log("Page not found 1", path);
        loadMyPage();
    }

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
            else if (pageType === 'chat') {
                loadChat();
            }
            else {
                console.log("Page not found", pageType);
                loadMyPage();
            }
        } 
        else {
            console.log("page not found 2");
            loadConnectPage();
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener("keydown", function(event) {
        if (event.key === "F5") {
            console.log("refresh");
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
            else if (lastPart === 'chat') {
                loadChat();
            }
            else {
                console.log("Page not found 3", lastPart);
                loadConnectPage();
            }
        }
    });
});
// document.addEventListener('DOMContentLoaded', loadConnectPage);

window.addEventListener('load', function () {
    const initialPage = window.location.pathname.split('/').pop() || 'connect';
    const initialState = { page: initialPage };
    history.replaceState(initialState, '', window.location.pathname);
});

const OnlineUsers = {
    users: [], 
    updateUsers(newUsers) {
        this.users = newUsers; 
        this.notify();
    },
    notify() {
        const event = new CustomEvent("usersUpdated", { detail: this.users });
        window.dispatchEvent(event);
    }
};

// websocket variables
let chatSocket = null;
let presenceOnline = null;

function checkStatus() {
    const wsScheme_ = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsScheme_}://${window.location.host}/ws/users/presence/`;
    presenceOnline = new WebSocket(wsUrl);

    console.log("CheckStatus");
    presenceOnline.onopen = () => {
        console.log("WebSocket connecté !");
    };

    presenceOnline.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "online_users_list") {
            OnlineUsers.updateUsers(data.online_users);
        } else if (data.type === "user_presence") {
            let updatedUsers = [...OnlineUsers.users];

            if (data.status === "online") {
                // Ajouter l'utilisateur s'il n'est pas déjà dans la liste
                if (!updatedUsers.some(user => user.user_id === data.user_id)) {
                    updatedUsers.push({ user_id: data.user_id, username: data.username });
                }
            } else if (data.status === "offline") {
                // Retirer l'utilisateur s'il est dans la liste
                updatedUsers = updatedUsers.filter(user => user.user_id !== data.user_id);
            }

            OnlineUsers.updateUsers(updatedUsers);
        }

        // Mise à jour des icônes de statut
        updateStatusIcons();
        console.log("C'est le user " + OnlineUsers.users.username)
    };

    presenceOnline.onclose = () => {
        console.log("WebSocket déconnecté !");
    };

    presenceOnline.onerror = (error) => {
        console.error("Erreur WebSocket :", error);
    };
}

function updateStatusIcons() {
    const avatars = document.getElementsByClassName('status');

    Array.from(avatars).forEach(icon => {
        const username = icon.getAttribute('data_name');

        // Vérifie si l'utilisateur est présent dans OnlineUsers.users
        const isOnline = OnlineUsers.users.some(user => user.username === username);

        if (isOnline) {
            icon.classList.remove("text-secondary"); // Enlève le gris
            icon.classList.add("text-success");      // Ajoute le vert
        } else {
            icon.classList.remove("text-success");   // Enlève le vert
            icon.classList.add("text-secondary");    // Ajoute le gris
        }
    });
}


