function getUsers () {
    
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



function createActionButtons(userId) {
    const actions = [
        { icon: 'bi bi-person-plus-fill', text: 'Add', action: () => inviteUser(userId) },
        { icon: 'bi bi-person-x-fill', text: 'Remove', action: () => deleteUser(userId) },
        { icon: 'bi bi-person-dash', text: 'Block', action: () => blockUser(userId) },
        { icon: 'bi bi-person-check', text: 'Unblock', action: () => unblockUser(userId) },
    ];

    const container = document.createElement('div');
    container.classList.add('me-3');

    actions.forEach(({ icon, text, action }) => {
        const button = document.createElement('a');
        button.className = 'btn btn-primary btn-add shadow hover-container';
        button.setAttribute('role', 'button');
        button.addEventListener('click', action); // Attache une action spécifique

        button.innerHTML = `
            <i class="bi ${icon} icon"></i>
            <div class="hover-text">${text}</div>
        `;

        container.appendChild(button);
    });

    return container;
}

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

document.addEventListener('DOMContentLoaded', loadFriendsList, getUsers);

const API_URL = '/users/friendship/';

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

// Fonction pour supprimer ou retirer un utilisateur
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

// ==========================================================================

// Fonction pour faire une requête POST et récupérer les utilisateurs
function fetchUserList(action) {
    const csrfToken = getCookie('csrftoken');
    fetch(`/users/contact?action=${action}`, {
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
            displayUserList(data);
        } else {
            alert('Aucun utilisateur trouvé.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la récupération des données.');
    });
}

function displayUserList(users) {
    console.log(users);
    const userListContainer = document.getElementById('list');
    userListContainer.innerHTML = '';

    users.forEach(user => {
        const winRatio = user.games_win && user.games_lose 
			? (user.games_win / user.games_lose).toFixed(2) 
			: 0;

		// Créer l'élément principal pour un utilisateur
		const friendDiv = document.createElement('div');
		friendDiv.className = "friends_info my-2 d-flex justify-content-between align-items-center border-bottom border-3";
		friendDiv.style.marginInline = "10%";
		friendDiv.style.minWidth = "450px";

		// HTML pour les informations utilisateur
		const userInfoHtml = `
			<div class="d-flex mx-3 my-1">
				<img src="${user.avatar_url || 'img/default.jpg'}" class="img-profil-60" alt="img-profil">
					<div class="ms-5">
						<h5 class="text fw-bold ms-5">${user.username || 'Unknown'}</h5>
						<p class="text ms-4">
							Games Played: ${user.games_played || 0} 🕹️
							Wins: ${user.games_win || 0} 🏆
							Losses: ${user.games_lose || 0} 💀
							Ratio: ${winRatio} ⚖️
						</p>
					</div>


			</div>
		`;

		friendDiv.innerHTML = userInfoHtml;

		// Ajouter les boutons d'action générés dynamiquement
		const actionButtons = createActionButtons(user.id || '');
		friendDiv.appendChild(actionButtons);

		// Ajouter cet utilisateur à la liste
		userListContainer.appendChild(friendDiv);
    });
}

function actionButton()
{
    console.log("Set button");
    document.getElementById('showAllUserBtn').addEventListener('click', () => {
        fetchUserList('users');
    });
    
    document.getElementById('showFriendsBtn').addEventListener('click', () => {
        fetchUserList('added');
    });
    
    document.getElementById('showBlockedBtn').addEventListener('click', () => {
        fetchUserList('blocked');
    });
}

function selectUser()
{
    loadFriendsList();
    getUsers();
    actionButton();
}



     

