function handleChat(){
	let current_user = null 
    
    fetch(`/chat2/get_current_user`)
    .then(response => response.json())
    .then(data => {
        if (data) {
            current_user = data.current_user;
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });

	const chatArea = document.getElementById("chat-area")
	const messagesContainer = document.querySelector(".messages-container");
	const messageForm = document.getElementById("message-form");
	const messageInput = document.getElementById("message-input");
	const userSearchInput = document.getElementById("userSearchInput");
	const userList = document.getElementById("userList");
	const chatHeader = document.querySelector(".contact-details strong");
	const avatarFriends = document.getElementById("avatarFriend");
	const blockUserIcon = document.getElementById("blockUser");
    const unblockUserIcon = document.getElementById("unblockUser");

	
	fetch(`/chat2/search_users?query=all`)
		.then(response => response.json())
		.then(data => { createUserEntry(data); });

	// Fonction pour initialiser WebSocket pour le canal spécifié
	function initWebSocket(channelId) {
		if (chatSocket) {
			chatSocket.close(); // Fermer la connexion précédente si elle existe
		}

		const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
		const wsUrl = `${wsScheme}://${window.location.host}/chat2/chat/private_${channelId}/`;
		chatSocket = new WebSocket(wsUrl);

		chatSocket.onopen = function () {
		};

		chatSocket.onclose = function () {
		};

		chatSocket.onmessage = function (e) {
			const data = JSON.parse(e.data);
			const messageElement = document.createElement("p");
			messageElement.textContent = `${data.sender}: ${data.message}`;
			messageElement.classList.add(data.sender === current_user ? "send" : "receive");
			messagesContainer.appendChild(messageElement);
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		};
	}

	window.addEventListener('beforeunload', () => {
		if (chatSocket) {
			chatSocket.close();  // Fermer proprement la connexion WebSocket
		}
	});

	// Fonction pour charger les messages d'un canal
	function loadMessages(channelId) {
		fetch(`/chat2/load_messages?query=${channelId}`)
			.then(response => {
				if (!response.ok) {
					throw new Error(gettext("Failed to load messages"));
				}
				return response.json();
			})
			.then(data => {
				messagesContainer.innerHTML = "";  // Réinitialiser la zone de messages
				data.messages.forEach(msg => {
					const messageElement = document.createElement("p");
					messageElement.textContent = `${msg.sender__username}: ${msg.content}`;
					messageElement.classList.add(msg.sender__username === current_user ? "send" : "receive");
					
					messagesContainer.appendChild(messageElement);
				});
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			})
			.catch(error => {
			console.error("Erreur lors du chargement des messages :", error);
			messagesContainer.innerHTML = gettext("<p>Impossible to load messages, try again later.</p>");
		});
	}

	// Fonction pour gérer le clic sur un utilisateur de la liste
	function handleUserClick(user) {
		const noConversationP = document.getElementById('no-conversation');
		if (noConversationP) {
				noConversationP.remove();
			}
		if (chatArea) {
			chatArea.style.visibility = 'visible';
		}
		const user2Id = user.id;
		chatHeader.textContent = user.username;
		avatarFriends.src = user.avatar;
		avatarFriends.dataset.userId = user.id;
		
		// changer par les dernier message eu
		userSearchInput.value = "";
		
		loadMessages(user.id);
		initWebSocket(user.id);

		if (chatHeader) {
			chatHeader.addEventListener("click", function() {
				localStorage.setItem('opponentName', user.username);
				localStorage.setItem('opponentId', user.id);
				loadStats();
			})
		}

		fetch(`/chat2/search_users?query=all`)
				.then(response => response.json())
				.then(data => {
					createUserEntry(data);
				});
	}
	
	// Envoi de messages via le WebSocket
	messageForm.addEventListener("submit", function (e) {
		e.preventDefault();
		const message = messageInput.value.trim();
		if (message && chatSocket) {
			chatSocket.send(JSON.stringify({
				"message": message
			}));
			messageInput.value = "";
		}
	});

// ==============================================================================================
	// Recherche d'utilisateurs
	userSearchInput.addEventListener("input", function () {
		const query = userSearchInput.value.trim();
		if (query.length >= 2) {
			fetch(`/chat2/search_users?query=${query}`)
				.then(response => response.json())
				.then(data => {
					createUserEntry(data);
				});
		} else {
			userList.innerHTML = "";
		}
	});

	function createUserEntry(data) {
		userList.innerHTML = "";
		data.results.forEach(user => {
			const userEntry = document.createElement("div");
			userEntry.classList.add("user-entry", "d-flex", "align-items-center", "mb-3");
			userEntry.innerHTML = `
				<img src="${user.avatar}" alt="Avatar" class="img-fluid rounded-circle me-3" style="width: 50px; height: 50px;">
				<div data_user_id='${user.id}'>
					<div class="user-details"><strong>${user.username}</strong></div>
					<div class="last-message text-muted">${user.last_message || gettext("No message")}</div>
				</div>
			`;
			userEntry.addEventListener("click", () => handleUserClick(user)); // Attacher l'événement clic
			userList.appendChild(userEntry);
		});
	}

}