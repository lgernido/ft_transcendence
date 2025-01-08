function lobby_public() {
    const playerName1 = document.querySelector('.card-lobby-text-name1');
    const playerName2 = document.querySelector('.card-lobby-text-name2');

    playerName1.classList.add('color-player-red');
    playerName2.classList.add('color-player-green');
    
    const roomName = document.getElementById("check-invite").textContent;
    if (roomName === "Nop" || !roomName) {
        console.log("Create new room");
        createRoomPu();
    }
    else {
        console.log("Connect websocket");
        InitWebSocketRoomP(roomName)
    }

    handleColorChange();
    handlePointchange();
    handleReadyChange();
    handleQuitButton();
    handleStartButton();
}   

function createRoomPu() {
    fetch(`/find_or_create_room/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            displayError("Failed to create room");
        }
    })
    .then(data => {
        console.log("Room created successfully:", data.room_name);
        InitWebSocketRoomP(data.room_name);
    })
    .catch(error => {
        loadMyPage();
        displayError("Error creating room:", error);
    });
}

function InitWebSocketRoomP(roomName) {
    socket_roomPu = new WebSocket(`wss://${window.location.host}/ws/lobby/${roomName}/`);

    const currentUser = document.getElementById("user-info").dataset.username;
    const currentAvatar = document.getElementById("user-info").dataset.avatar;

    socket_roomPu.onopen = () => {
        console.log("WebSocket connection established for room: ", roomName);

        socket_roomPu.send(JSON.stringify({
            type: "init",
            username: currentUser,
            avatar: currentAvatar,
        }));
    };

    socket_roomPu.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        const playerName1 = document.getElementById("playerName1");
        const playerName2 = document.getElementById("playerName2");
        const avatarPlayer1 = document.getElementById("avatarPlayer1");
        const avatarPlayer2 = document.getElementById("avatarPlayer2");
        const readyCheckboxPlayer1 = document.getElementById('readyPlayer1');
        const readyCheckboxPlayer2 = document.getElementById('readyPlayer2');
        const selectColorPlayer1 = document.getElementById('selectColorPlayer1');
        const selectColorPlayer2 = document.getElementById('selectColorPlayer2');
        
        if (!data || !playerName1 || !avatarPlayer1 || !readyCheckboxPlayer1 || !selectColorPlayer1 || !playerName2 || !avatarPlayer2 || !readyCheckboxPlayer2 || !selectColorPlayer2) {
            return;
        }
        
        if (data.type === 'room_closed') {
            alert(data.message);
            if (socket_roomPu) {
                socket_roomPu.close();
                socket_roomPu = null;
            }
            const csrfToken = getCookie('csrftoken');
            fetch('/reset_room_session/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            }).then(response => {
                if (response.ok) {
                    console.log('Session roomName réinitialisée.');
                } else {
                    console.error('Erreur lors de la réinitialisation de la session.');
                }
            });
            loadMyPage();
            return;
        }

        if (data.type === "player_left") {
            alert(data.message); // Exemple : afficher un message d'alerte
            return ;
        }
    
        if (playerName1 && avatarPlayer1 && data.player1 && avatarPlayer1) {
            playerName1.textContent = data.player1.username;
            avatarPlayer1.src = data.player1.avatar;
            updatePlayerColor(playerName1, data.player1.color);
            selectColorPlayer1.value = data.player1.color;
        }
    
        if (playerName2 && avatarPlayer2) {
            if (data.player2) {
                playerName2.textContent = data.player2.username;
                avatarPlayer2.src = data.player2.avatar;
                updatePlayerColor(playerName2, data.player2.color);
                selectColorPlayer2.value = data.player2.color;
            } else {
                playerName2.textContent = "Waiting Player";
                avatarPlayer2.src = "/media/avatars/default_avatar.png";
            }
        }

        // Handle point
        const pointsLimitInput = document.getElementById("maxPoint");
        if (data.points_limit !== undefined) {
            if (pointsLimitInput)
                pointsLimitInput.value = data.points_limit;
        }

        // Handle ready button
        if (data.player1.ready !== undefined) {
            readyCheckboxPlayer1.checked = data.player1.ready;
            const label1 = document.querySelector('label[for="readyPlayer1"]');
            if (data.player1.ready) {
                label1.classList.remove('btn-outline-secondary');
                label1.classList.add('btn-outline-success');
            } else {
                label1.classList.remove('btn-outline-success');
                label1.classList.add('btn-outline-secondary');
            }
        }
        if (data.player2.ready !== undefined) {
            readyCheckboxPlayer2.checked = data.player2.ready;
            const label2 = document.querySelector('label[for="readyPlayer2"]');
            if (data.player2.ready) {
                label2.classList.remove('btn-outline-secondary');
                label2.classList.add('btn-outline-success');
            } else {
                label2.classList.remove('btn-outline-success');
                label2.classList.add('btn-outline-secondary');
            }
        }

        if (data.type === 'start_game') {
            if (data.player1.ready && data.player2.ready) {
                if (socket_roomP) { 
                    socket_roomPu.close();
                    socket_roomPu = null;
                }
                loadGamePrivate(roomName, pointsLimitInput.value, data);
            }
        }

        blockInteract();
    };

    socket_roomPu.onclose = function () {
        console.log("Disconnected from room:", roomName);
    };
}


function updatePlayerColor(playerElement, newColor) {
    const colorClasses = [
        'color-player-red', 
        'color-player-green', 
        'color-player-blue', 
        'color-player-yellow', 
        'color-player-cyan', 
        'color-player-magenta', 
        'color-player-orange', 
        'color-player-purple', 
        'color-player-pink', 
        'color-player-gray'
    ];
    playerElement.classList.remove(...colorClasses);

    if (newColor) {
        playerElement.classList.add(newColor);
    }
}

function blockInteract() {
    const currentUser = document.getElementById("user-info").dataset.username;
    const isPlayer1 = playerName1.textContent.trim();
    const isPlayer2 = playerName2.textContent.trim();

    const selectPlayer1 = document.getElementById('selectColorPlayer1');
    const selectPlayer2 = document.getElementById('selectColorPlayer2');

    const readyCheckboxPlayer1 = document.getElementById('readyPlayer1');
    const readyCheckboxPlayer2 = document.getElementById('readyPlayer2');

    if (isPlayer1 == currentUser) {
        selectPlayer2.disabled = true;
        readyCheckboxPlayer2.disabled = true;
    } else if (isPlayer2 == currentUser) {
        selectPlayer1.disabled = true;
        readyCheckboxPlayer1.disabled = true;
    } else {
        selectPlayer1.disabled = true;
        selectPlayer2.disabled = true;
        readyCheckboxPlayer1.disabled = true;
        readyCheckboxPlayer2.disabled = true;
    }
}

function handlePointchange() {
    document.getElementById("maxPoint").addEventListener("input", function(event) {
        const maxPoints = event.target.value;
        
        if (maxPoints.value < 1)
            maxPoints.value = 1;
        else if (maxPoints.value > 40)
            maxPoints.value = 40;

        socket_roomPu.send(JSON.stringify({
            type: 'points_limit_change',
            points_limit: maxPoints
        }));
    });
}

function handleColorChange() {

    function sendColorChange(playerId, color) {
        const message = {
            type: "color_change",
            playerId: playerId,
            color: color
        };
        console.log("Update couleur: ", message);
        socket_roomPu.send(JSON.stringify(message));
    }

    document.getElementById('selectColorPlayer1').addEventListener('change', function (e) {
        const newColor = e.target.value;
        playerName1.classList.add(newColor);
        sendColorChange('player1', newColor);
    });

    document.getElementById('selectColorPlayer2').addEventListener('change', function (e) {
        const newColor = e.target.value;
        playerName2.classList.add(newColor);
        sendColorChange('player2', newColor);
    });
}

function handleReadyChange(){
    function sendReadyState(playerId, isReady) {
        const message = {
            type: "ready_state_change",
            playerId: playerId,
            ready: isReady
        };
        socket_roomPu.send(JSON.stringify(message));
    }

    const currentUser = document.getElementById("user-info").dataset.username;
    const readyCheckboxPlayer1 = document.getElementById('readyPlayer1');
    const readyCheckboxPlayer2 = document.getElementById('readyPlayer2');

    readyCheckboxPlayer1.addEventListener('change', function (e) {
        if (currentUser === playerName1.textContent.trim()) {
            const isReady = e.target.checked;
            sendReadyState('player1', isReady);
        }
    });
    readyCheckboxPlayer2.addEventListener('change', function (e) {
        if (currentUser === playerName2.textContent.trim()) {
            const isReady = e.target.checked;
            sendReadyState('player2', isReady);
        }
    });
}

function handleQuitButton() {
    const leaveBtn = document.getElementById("leaveRoomButton");
    if (leaveBtn) {
        leaveBtn.addEventListener("click", () => {
            if (socket_roomPu && socket_roomPu.readyState === WebSocket.OPEN) {
                socket_roomPu.send(JSON.stringify({ type: "leave_room" }));
            }

            if (socket_roomPu) {
                socket_roomPu.close();
                socket_roomPu = null;
            }
            const csrfToken = getCookie('csrftoken');
            fetch('/reset_room_session/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            }).then(response => {
                if (response.ok) {
                    console.log('Session roomName réinitialisée.');
                } else {
                    console.error('Erreur lors de la réinitialisation de la session.');
                }
            });
            loadMyPage();
        });
    }
}

function handleStartButton() {
    const btnReady = document.getElementById("btn-ready");

    btnReady.addEventListener('click', () => {
        socket_roomPu.send(JSON.stringify({
            type: 'start_game'
        }));
    });
}