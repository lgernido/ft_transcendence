function handleChat(){
	let current_user = null 
    
    fetch(`/chat2/get_current_user`)
    .then(response => response.json())
    .then(data => {
        if (data) {
            current_user = data.current_user;  // Stocker les données dans current_user
        } else {
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });

	const chatArea = document.querySelector(".messages-container");
	const messageForm = document.getElementById("message-form");
	const messageInput = document.getElementById("message-input");
	const userSearchInput = document.getElementById("userSearchInput");
	const userList = document.getElementById("userList");
	const chatHeader = document.querySelector(".contact-details strong");

	let currentChannelId = null;
	let chatSocket = null;

	
	// Fonction pour initialiser WebSocket pour le canal spécifié
	function initWebSocket(channelId) {
		if (chatSocket) {
			chatSocket.close(); // Fermer la connexion précédente si elle existe
		}

		const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
		const wsUrl = `${wsScheme}://${window.location.host}/chat2/chat/private_${channelId}/`;
		chatSocket = new WebSocket(wsUrl);
		chatSocket.onerror = function(event){console.log(event)}

		chatSocket.onopen = function () {
		};

		chatSocket.onclose = function () {
		};

		chatSocket.onmessage = function (e) {
			const data = JSON.parse(e.data);
			const messageElement = document.createElement("p");
			messageElement.textContent = `${data.sender}: ${data.message}`;
			messageElement.classList.add(data.sender === current_user ? "send" : "receive");
			chatArea.appendChild(messageElement);
			chatArea.scrollTop = chatArea.scrollHeight;
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
					throw new Error("Failed to load messages");
				}
				return response.json();
			})
			.then(data => {
				chatArea.innerHTML = "";
				data.messages.forEach(msg => {
					const messageElement = document.createElement("p");
					messageElement.textContent = `${msg.sender__username}: ${msg.content}`;
					messageElement.classList.add(msg.sender__username === current_user ? "send" : "receive");
					
					chatArea.appendChild(messageElement);
				});
				chatArea.scrollTop = chatArea.scrollHeight;
			})
			.catch(error => {
			console.error("Erreur lors du chargement des messages :", error);
			chatArea.innerHTML = "<p>Impossible de charger les messages. Essayez plus tard.</p>";
		});
	}

	// Fonction pour gérer le clic sur un utilisateur de la liste
	function handleUserClick(user, userList, userSearchInput) {
		const user2Id = user.id; // ID de l'utilisateur sélectionné
		// Mettre à jour le nom du contact dans le chat header
		chatHeader.textContent = user.username;
		image = document.getElementById('imgContact');
        image.src = user.avatar;

		// Charger les anciens messages et établir la connexion WebSocket pour le nouveau canal
		loadMessages(user.id);
		initWebSocket(user.id);
		userList.innerHTML = "";
		userSearchInput.value = "";
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
		if (query.length >= 1) {
			fetch(`/chat2/search_users?query=${query}`)
				.then(response => response.json())
				.then(data => {
					userList.innerHTML = "";
					data.results.forEach(user => {
						const userEntry = document.createElement("div");
						userEntry.classList.add("user-entry", "d-flex", "align-items-center", "mb-3");
						userEntry.innerHTML = `
							<img src="${user.avatar}" alt="Avatar" class="img-fluid rounded-circle me-3" style="width: 50px; height: 50px;">
							<div data_user_id='${user.id}'>
								<div class="user-details"><strong>${user.username}</strong></div>
								<div class="last-message text-muted">${user.last_message || "Aucun message"}</div>
							</div>
						`;
						userEntry.addEventListener("click", () => handleUserClick(user, userList, userSearchInput)); // Attacher l'événement clic
						userList.appendChild(userEntry);
					});
				});
		} else {
			userList.innerHTML = ""; // Effacer la liste si la recherche est vide
		}
	});

//=========================================
    // function fetchUserConversations() {
    //     fetch('/chat2/user_conversations/')
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log('Conversations utilisateur :', data);
    //         })
    //         .catch(error => {
    //             console.error('Erreur lors de la requête :', error);
    //         });
    // }

    // // Lancer la fonction toutes les 1 seconde
    //  setInterval(fetchUserConversations, 10000);
//===========================================
}