// ==========================================================================
// Gestion du chargement initial
// ==========================================================================

function selectUser() {
    loadFriendsList();
    getUsers();
    actionButton();
}

// ==========================================================================
// Gestion des utilisateurs (API et interactions)
// ==========================================================================

function inviteUser(userId) {
    
    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
        console.log('CSRF token not found. Please refresh the page.');
        return;
    }
    
    // Effectuer une requête API pour ajouter l'utilisateur
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken, // Ajout du token CSRF
        },
        body: JSON.stringify({
            action: 'add',
            user_id: userId
        }),
    })
    .then(response => response.json())
    .then(data => {
        alert(`User ${userId} has been add || ${data}`);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function deleteUser(userId) {
    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
        console.log('CSRF token not found. Please refresh the page.');
        return;
    }
    
    if (confirm(`Are you sure you want to remove user ${userId} from your list?`)) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                action: 'remove',
                user_id: userId
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete the user');
            }
            return response.json();
        })
        .then(data => {
            alert(`User ${userId} has been removed successfully!`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while removing the user.');
        });
    }
}

// Fonction pour bloquer un utilisateur
function blockUser(userId) {
    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
        console.log('CSRF token not found. Please refresh the page.');
        return;
    }
    
    if (confirm(`Are you sure you want to block user ${userId}?`)) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                action: 'block',
                user_id: userId
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to block the user');
            }
            return response.json();
        })
        .then(data => {
            alert(`User ${userId} has been blocked successfully!`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while blocking the user.');
        });
    }
}

// Fonction pour débloquer un utilisateur
function unblockUser(userId) {
    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
        console.log('CSRF token not found. Please refresh the page.');
        return;
    }
    
    if (confirm(`Are you sure you want to unblock user ${userId}?`)) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                action: 'unblock',
                user_id: userId
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to unblock the user');
            }
            return response.json();
        })
        .then(data => {
            alert(`User ${userId} has been unblocked successfully!`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while unblocking the user.');
        });
    }
}
function getUsers() {

    const search_user = document.getElementById('search_user'); // Utilisez `document.getElementById`
    
    if (!search_user) {
        console.error("L'élément #search_user n'a pas été trouvé dans le DOM.");
        return;
    }

    search_user.addEventListener("input", function () {
        const csrfToken = getCookie('csrftoken'); // Assurez-vous que `getCookie` est bien définie
        const query = search_user.value.trim();
        if (search_user.value.length == 0)
            // if (query.length == 0)
            fetchUserList('users')
        else if (query.length > 0) {
            fetch(`/users/get_users?query=${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de la récupération des utilisateurs');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && Array.isArray(data)) {
                        displayUserList(data, '');
                    } else {
                        alert('Aucun utilisateur trouvé.');
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de la récupération des données.');
                });
        }
    });
};

function loadFriendsList() {
    fetch('/users/user_profiles/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            return response.json();
        })
        .then(data => {
            if (data && Array.isArray(data)) {
                displayUserList(data, 'users');
            } else {
                alert('Aucun utilisateur trouvé.');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Impossible de charger la liste d\'amis.');
        });
}

function fetchUserList(action) {
    console.log(`Tentative de récupération des utilisateurs pour l'action : ${action}`);
    const csrfToken = getCookie('csrftoken');

    fetch(`/users/contact?action=${action}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => {
        console.log("Réponse obtenue :", response);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
        console.log("Données JSON reçues user :", data);
        displayUserList(data, action);
    })
    .catch(error => {
        console.error("Erreur lors de la requête :", error);
        alert("Une erreur est survenue : " + error.message);
    });
}

// ==========================================================================
// Gestion de l'interface utilisateur
// ==========================================================================

function actionButton() {
    console.log("Set button");
    
    const showAllUserBtn = document.getElementById('showAllUserBtn');
    const showFriendsBtn = document.getElementById('showFriendsBtn');
    const showBlockedBtn = document.getElementById('showBlockedBtn');
    
    if (showAllUserBtn && showFriendsBtn && showBlockedBtn) {
        showAllUserBtn.addEventListener('click', () => {
            console.log("Bouton 'Afficher tous les utilisateurs' cliqué");
            fetchUserList('users');
        });
        
        showFriendsBtn.addEventListener('click', () => {
            console.log("Bouton 'Afficher les amis' cliqué");
            fetchUserList('added');
        });
        
        showBlockedBtn.addEventListener('click', () => {
            console.log("Bouton 'Afficher les utilisateurs bloqués' cliqué");
            fetchUserList('blocked');
        });
    } else {
        console.error("Un ou plusieurs boutons n'ont pas été trouvés dans le DOM");
    }
}

async function extractValueProfileFriends(userId) {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await fetch(`/extractProfile/?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        return {
            gamesWin: data.profile.games_win,
            gamesLose: data.profile.games_lose,
            gamesDraw: data.profile.games_draw,
        };
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return { gamesWin: 0, gamesLose: 0, gamesDraw: 0 };
    }
}

async function generateUserHTML(user, action) {
    const userTemplate = document.getElementById('user-template').content.cloneNode(true);
    // const isOnline = OnlineUsers.users.some(onlineUser => onlineUser.username === user.username);
    
    const { gamesWin, gamesLose, gamesDraw } = await extractValueProfileFriends(user.id);
    const totalGame = gamesWin + gamesLose + gamesDraw;
    
    let ratio = 0;
    if (gamesLose == 0) {
        ratio = gamesWin;
    }
    else {
        ratio = (gamesWin / gamesLose).toFixed(2);
    }
    
    userTemplate.querySelector('[data-user-name]').textContent = user.username || 'Unknown';
    userTemplate.querySelector('[data-user-avatar]').src = user.avatar_url;
    // userTemplate.querySelector('[data-icon]').classList = `status bi bi-circle-fill ${isOnline ? 'text-success' : 'text-secondary'}`;
    // userTemplate.querySelector('[data-icon]').setAttribute("data_name", user.username);
    
    const gamesPlayedElement = userTemplate.querySelector('[data-game-played]');
    const winsElement = userTemplate.querySelector('[data-win]');
    const lossesElement = userTemplate.querySelector('[data-lose]');
    const ratioElement = userTemplate.querySelector('[data-ratio]');

    gamesPlayedElement.textContent = totalGame;
    winsElement.textContent = gamesWin;
    lossesElement.textContent = gamesLose;
    ratioElement.textContent = ratio;
    
    const buttonsContainer = userTemplate.querySelector('[data-action-buttons]');
    const actionButtons = createActionButtons(user.id, action);
    buttonsContainer.appendChild(actionButtons);
    
    return userTemplate;
}

async function displayUserList(users, action) {
    const userListContainer = document.getElementById('list');
    userListContainer.innerHTML = "";

    for (const user of users) {
        const userHTML = await generateUserHTML(user, action);
        userListContainer.appendChild(userHTML);
    }
}


// Générer les boutons d'action à partir du template
function createActionButtons(userId, context) {
    const actions = [];

    // Ajustez les boutons en fonction du contexte
    if (context === 'blocked') {
        actions.push(
            { icon: 'bi bi-person-plus-fill', text: 'Add', action: () => inviteUser(userId) },
            { icon: 'bi bi-person-check', text: 'Unblock', action: () => unblockUser(userId) }
        );
    } else if (context === 'added') {
        actions.push(
            { icon: 'bi bi-person-x-fill', text: 'Remove', action: () => deleteUser(userId) },
            { icon: 'bi bi-person-dash', text: 'Block', action: () => blockUser(userId) }
        );  
    } else {
        actions.push(
            { icon: 'bi bi-person-plus-fill', text: 'Add', action: () => inviteUser(userId) },
            { icon: 'bi bi-person-dash', text: 'Block', action: () => blockUser(userId) },
        );
    }

    const container = document.createElement('div');
    container.classList.add('me-3');

    actions.forEach(({ icon, text, action }) => {
        const button = document.createElement('a');
        button.className = 'btn btn-primary btn-add shadow hover-container';
        button.setAttribute('role', 'button');
        button.addEventListener('click', action);

        button.innerHTML = `
            <i class="bi ${icon} icon"></i>
            <div class="hover-text">${text}</div>
        `;

        container.appendChild(button);
    });

    return container;
}
// ==========================================================================
// Utilitaires
// ==========================================================================

const API_URL = '/users/friendship/';