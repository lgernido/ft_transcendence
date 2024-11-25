console.log('test.0');

function createActionButtons(userId) {
const actions = [
// { icon: 'bi-envelope-open', text: 'Send message', action: () => sendMessage(userId) }, Remplacer par autre chose
{ icon: 'bi-plus-lg', text: 'Invite', action: () => inviteUser(userId) },
{ icon: 'bi-slash-circle', text: 'Block', action: () => blockUser(userId) },
// { icon: 'bi-trash', text: 'Delete', action: () => deleteUser(userId) },
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
.then(users => {
	// Sélectionner l'élément HTML qui contiendra la liste d'amis
	console.log(users);
	const friendsListContainer = document.querySelector('.friends_liste .d-flex.flex-column ');

	// Vider la liste actuelle pour la mettre à jour
	friendsListContainer.innerHTML = '';

	// Parcourir les utilisateurs et générer le HTML pour chaque utilisateur
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
		friendsListContainer.appendChild(friendDiv);
	});
})
.catch(error => {
	console.error('Erreur:', error);
	alert('Impossible de charger la liste d\'amis.');
});
}

// URL de votre API
const API_URL = '/users/friendship/'; // Remplacez par l'URL de votre API

// Fonction pour envoyer un message à un utilisateur
// function sendMessage(userId) {
// alert(`Sending message to user ${userId}`);

// // Effectuer une requête API pour envoyer un message
// fetch(API_URL, {
// method: 'POST',
// headers: {
// 	'Content-Type': 'application/json',
// 	'Authorization': 'Token YOUR_AUTH_TOKEN',  // Remplacez par votre token d'authentification
// },
// body: JSON.stringify({
// 	action: 'send_message',
// 	user_id: userId
// })
// })
// .then(response => response.json())
// .then(data => {
// alert(`Message sent to user ${userId}`);
// })
// .catch(error => {
// console.error('Error:', error);
// alert('Error sending message');
// });
// }

document.addEventListener('DOMContentLoaded', loadFriendsList);

// Fonction pour inviter un utilisateur à jouer

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

const csrfToken = getCookie('csrftoken'); // Assure-toi que 'csrftoken' est généré par Django
if (!csrfToken) {
console.log('CSRF token not found. Please refresh the page.');
return;
}
// Effectuer une requête API pour inviter l'utilisateur
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
credentials: 'same-origin' // Important pour inclure les cookies avec la requête
})
.then(response => response.json())
.then(data => {
})
.catch(error => {
console.error('Error:', error);
});
}


// Fonction pour bloquer un utilisateur
function blockUser(userId) {
if (confirm(`Are you sure you want to block user ${userId}?`)) {
alert(`User ${userId} has been blocked.`);

// Effectuer une requête API pour bloquer l'utilisateur
fetch(API_URL, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Token YOUR_AUTH_TOKEN',  // Remplacez par votre token d'authentification
	},
	body: JSON.stringify({
		action: 'block',
		user_id: userId
	})
})
.then(response => response.json())
.then(data => {
	alert(`User ${userId} blocked`);
})
.catch(error => {
	console.error('Error:', error);
	alert('Error blocking user');
});
}
}

// Fonction pour supprimer un utilisateur
function deleteUser(userId) {
if (confirm(`Are you sure you want to delete user ${userId}?`)) {
alert(`User ${userId} has been deleted.`);

// Effectuer une requête API pour supprimer l'utilisateur
fetch(API_URL, {
	method: 'POST',
	// headers: {
	//     'Content-Type': 'application/json',
	//     'Authorization': 'Token YOUR_AUTH_TOKEN',  // Remplacez par votre token d'authentification
	// },
	body: JSON.stringify({
		action: 'delete',
		user_id: userId
	})
})
.then(response => response.json())
.then(data => {
	alert(`User ${userId} deleted`);
})
.catch(error => {
	console.error('Error:', error);
	alert('Error deleting user');
});
}
}


// Appeler la fonction lorsque la page est chargée

console.log('test');