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
        const script = document.createElement('script');
        script.src = "/static/js/" + file;
        document.body.appendChild(script);
        script.onload = () => {
            func();
        }
    }
    else {
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
    stopAllIntervals();
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
    stopAllIntervals();
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
    stopAllIntervals();
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    if (wsPong) {
        wsPong.close();
        wsPong = null;
    }

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
                        'X-CSRFToken': csrfToken,
                        'X-Fetch-Request': 'true',
                    }
                })
                .then(response => response.text())
                .then(html => {
                    appDiv.innerHTML = html;
                    
                    if (history.state?.page !== 'mypage') {
                        const state = { page: 'mypage' };
                        history.pushState(state, '', "/mypage");
                    }
                    checkStatus();
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
    stopAllIntervals();
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
                loadConnectPage();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification :', error);
        });
}

function loadFriends() {
    stopAllIntervals();
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
                    loadscript('amis.js', () => selectUser());
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
    stopAllIntervals();
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

function loadTournament() {
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
            loadscript('lobby_tournament.js', () => tournament());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadLocal() {
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

            if (history.state?.page !== 'lobby_Lo') {
                const state = { page: 'lobby_Lo' };
                history.pushState(state, '', "/lobby_Lo");
            }
            loadscript('lobby.js', () => lobby());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPublic() {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    if (socket_roomP) {
        displayError("Vous etes deja dans une autre room")
        return ;
    }
    fetch('/lobby_public/', {
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
            loadscript('lobby_public.js', () => lobby_public());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPrivate() {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    if (socket_roomPu) {
        displayError("Vous etes deja dans une autre room")
        return ;
    }
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
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGameBot(maxPoints, colorP1, colorP2) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/GameBot/`, {
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

            if (history.state?.page !== `gameBot`) {
                const state = { page: `gameBot` };
                history.pushState(state, '', `/gameBot`);
            }
            loadscript('game.js', () => launchGameBot(maxPoints, colorP1, colorP2));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGamePrivateCustom(maxPoints, colorP1, colorP2) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/local/`, {
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

            if (history.state?.page !== `local`) {
                const state = { page: `local` };
                history.pushState(state, '', `/local`);
            }
            loadscript('gameCustom.js', () => launchGamePrivateCustom(maxPoints, colorP1, colorP2));

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGamePrivate(roomName, maxPoints, data) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/game/`, {
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

            if (history.state?.page !== `game`) {
                const state = { page: `game` };
                history.pushState(state, '', `/game`);
            }
            loadscript('gamePrivate.js', () => launchGamePrivate(roomName, maxPoints, data));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGameTournament(maxPoints, players) {
    displayError('');
    const appDiv = document.getElementById('app');
    const csrfToken = getCookie('csrftoken');
    fetch(`/tournament/`, {
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

            if (history.state?.page !== `tournament`) {
                const state = { page: `tournament` };
                history.pushState(state, '', `/tournament`);
            }
            loadscript('tournament.js', () => launchTournament(maxPoints, players));
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadChat() {
    stopAllIntervals();
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
    console.log("R3")
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
        checkStatus();
    }
    else if (path === '/gameBot/') {
        loadGameBot();
        checkStatus();
    }
    else if (path === '/lobby_Pr/') {
        loadPrivate();
        checkStatus();
    }
    else if (path === '/lobby_Lo/') {
        loadLocal();
        checkStatus();
    }
    else if (path === '/lobby_T/') {
        loadTournament();
        checkStatus();
    }
    else if (path === '/compte/') {
        loadAccount();
        checkStatus();
    }
    else if (path === '/amis/') {
        loadFriends();
        checkStatus();
    }
    else if (path === '/create_account/') {
        loadCreateAccount();
        checkStatus();
    }
    else if (path === '/connect/') {
        loadConnectPage();
    }
    else if (path === '/chat/') {
        loadChat();
        checkStatus();
    }
    else {
        loadMyPage();
    }

    window.addEventListener('popstate', function(event) {
        console.log("R2")
        if (event.state) {
            const pageType = event.state.page;

            if (pageType === 'mypage') {
                loadMyPage();
            }
            else if (pageType === 'stats') {
                loadStats();
            }
            else if (pageType === 'gameBot') {
                loadGameBot();
            }
            else if (pageType === 'lobby_Pr') {
                loadPrivate();
            }
            else if (pageType === 'lobby_Lo') {
                loadLocal();
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
                loadMyPage();
            }
        } 
        else {
            loadConnectPage();
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    console.log("R1")
    window.addEventListener("keydown", function(event) {
        if (event.key === "F5") {
            event.preventDefault();
            const path = window.location.pathname;
            const lastPart = path.split('/').filter(Boolean).pop();
            
            if (lastPart === 'mypage') {
                loadMyPage();
            }
            else if (lastPart === 'stats') {
                loadStats();
                checkStatus();
            }
            else if (lastPart === 'gameBot') {
                loadGameBot();
                checkStatus();
            }
            else if (lastPart === 'lobby_Pr') {
                loadPrivate();
                checkStatus();
            }
            else if (lastPart === 'lobby_Lo') {
                loadLocal();
                checkStatus();
            }
            else if (lastPart === 'lobby_T') {
                loadTournament();
                checkStatus();
            }
            else if (lastPart === 'compte') {
                loadAccount();
                checkStatus();
            }
            else if (lastPart === 'amis') {
                loadFriends();
                checkStatus();
            }
            else if (lastPart === 'create_account') {
                loadCreateAccount();
                checkStatus();
            }
            else if (lastPart === 'connect') {
                loadConnectPage();
            }
            else if (lastPart === 'chat') {
                loadChat();
                checkStatus();
            }
            else {
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
let socket_roomP = null;
let socket_roomPu = null;
let presenceOnline = null;
let wsPong = null;

// setintervall variables
let paddleInterval = null;
let ballInterval = null;
let moveIaInterval = null;
let calcIaInterval = null;

function stopAllIntervals() {
    if (paddleInterval) {
        clearInterval(paddleInterval);
        paddleInterval = null;
        console.log("Paddle clear");
    }
    if (ballInterval) {
        clearInterval(ballInterval);
        ballInterval = null;
        console.log("ball clear");
    }
    if (moveIaInterval) {
        clearInterval(moveIaInterval);
        moveIaInterval = null;
        console.log("moveia clear");
    }
    if (calcIaInterval) {
        clearInterval(calcIaInterval);
        calcIaInterval = null;
        console.log("calcia clear");
    }
}


function checkStatus() {
    const wsUrl = `wss://${window.location.host}/ws/users/presence/`;
    if (!presenceOnline)
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

window.addEventListener('beforeunload', function(event) {
    closeAllOpenWebSocket();
});