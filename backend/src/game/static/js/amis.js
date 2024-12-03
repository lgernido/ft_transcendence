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
                        displayUserList(data); // Assurez-vous que `displayUserList` est bien définie
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
    // Effectuer une requête GET vers l'API
    fetch('/users/user_profiles/') // Remplacez par l'URL de votre API
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            return response.json();
        })
        .then(data => {
            if (data && Array.isArray(data)) {
                displayUserList(data);
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
    console.log("CSRF Token utilisé :", csrfToken);

    // Vérifie si le token CSRF est valide
    if (!csrfToken) {
        console.error("CSRF token manquant !");
    }

    // Construction de la requête fetch
    fetch(`/users/contact?action=${action}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,  // En-tête du token CSRF
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
        console.log("Données JSON reçues :", data);
        displayUserList(data);
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

function generateUserHTML(user) {
    const userTemplate = document.getElementById('user-template').content.cloneNode(true);
    
    // Remplace les valeurs dynamiques dans le template cloné
    userTemplate.querySelector('[data-user-name]').textContent = user.username || 'Unknown';
    userTemplate.querySelector('[data-user-avatar]').src = user.avatar || '/static/img/bob.jpg';
    
    const statsElement = userTemplate.querySelector('[data-user-stats]');
    statsElement.innerHTML = statsElement.innerHTML
    .replace('{% trans "Games Played" %}', user.games_played + ' 🕹️')
    .replace('{% trans "Wins" %}', user.wins + ' 🏆')
    .replace('{% trans "Losses" %}', user.losses + ' 💀')
    .replace('{% trans "Ratio" %}', user.ratio + ' ⚖️');
    
    const buttonsContainer = userTemplate.querySelector('[data-action-buttons]');
    const actionButtons = createActionButtons(user.id);
    buttonsContainer.appendChild(actionButtons);
    
    return userTemplate;
}

// Afficher la liste des utilisateurs
function displayUserList(users) {
    const userListContainer = document.getElementById('list');
    userListContainer.innerHTML = "";
    
    users.forEach(user => {
        const userHTML = generateUserHTML(user);
        userListContainer.appendChild(userHTML);
    });
}

// Générer les boutons d'action à partir du template
function createActionButtons(userId) {
    const container = document.createElement('div');
    const actionButtonsTemplate = document.getElementById('action-buttons-template').content.cloneNode(true);
    
    // Ajoutez des écouteurs d'événements pour chaque bouton d'action
    actionButtonsTemplate.querySelector('[data-action="add"]').addEventListener('click', () => inviteUser(userId));
    actionButtonsTemplate.querySelector('[data-action="remove"]').addEventListener('click', () => deleteUser(userId));
    actionButtonsTemplate.querySelector('[data-action="block"]').addEventListener('click', () => blockUser(userId));
    actionButtonsTemplate.querySelector('[data-action="unblock"]').addEventListener('click', () => unblockUser(userId));
    
    container.appendChild(actionButtonsTemplate);
    
    return container;
}
// ==========================================================================
// Utilitaires
// ==========================================================================

// Fonction pour récupérer un cookie spécifique
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith(`${name}=`)) {
                cookieValue = decodeURIComponent(trimmedCookie.substring(name.length + 1));
            }
        });
    }
    return cookieValue;
}

// Fonction pour afficher une erreur
function displayError(message) {
    console.error(message);
}

const API_URL = '/users/friendship/';