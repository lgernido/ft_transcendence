function lobby_public() {
    const playerName1 = document.querySelector('.card-lobby-text-name1');
    const playerName2 = document.querySelector('.card-lobby-text-name2');

    playerName1.classList.add('color-player-red');
    playerName2.classList.add('color-player-green');
    
    if (!roomNameGlobal) {
        createRoomPu();
    }
    else {
        InitWebSocketRoomPu(roomNameGlobal)
    }
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
            displayError(gettext("Failed to create room"));
        }
    })
    .then(data => {
        InitWebSocketRoomPu(data.room_name);
    })
    .catch(error => {
        loadMyPage();
        displayError(gettext("Error creating room:", error));
    });
}

function InitWebSocketRoomPu(roomName) {
    if (socket_roomP) {
        socket_roomP.close();
        socket_roomP = null;
    }
    socket_roomPu = new WebSocket(`wss://${window.location.host}/ws/lobby/${roomName}/`);

    const currentUser = document.getElementById("user-info").dataset.username;
    const currentAvatar = document.getElementById("user-info").dataset.avatar;

    roomNameGlobal = roomName;
    socket_roomPu.onopen = () => {
        handleColorChangePu();
        handlePointchangePu();
        handleReadyChangePu();
        handleQuitButtonPu();
        handleStartButtonPu();
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
            roomNameGlobal = null;
            displayError(data.message);
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
                    // console.log('Session roomName réinitialisée.');
                } else {
                    console.error('Erreur lors de la réinitialisation de la session.');
                }
            });
            loadMyPage();
            return;
        }

        if (data.type === "player_left") {
            const readyCheckboxPlayer1 = document.getElementById('readyPlayer1');
            const readyCheckboxPlayer2 = document.getElementById('readyPlayer2');
            if (readyCheckboxPlayer1)
                readyCheckboxPlayer1.checked = false;
            if (readyCheckboxPlayer2)
                readyCheckboxPlayer2.checked = false;
            enableAllButtonsHeader();
            displayError(data.message)
            return ;
        }
    
        if (playerName1 && avatarPlayer1 && data.player1 && avatarPlayer1) {
            playerName1.textContent = data.player1.username;
            avatarPlayer1.src = data.player1.avatar;
            updatePlayerColorPu(playerName1, data.player1.color);
            selectColorPlayer1.value = data.player1.color;
        }
    
        if (playerName2 && avatarPlayer2) {
            if (data.player2) {
                playerName2.textContent = data.player2.username;
                avatarPlayer2.src = data.player2.avatar;
                updatePlayerColorPu(playerName2, data.player2.color);
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
                sessionStorage.removeItem('roomName');
                sessionStorage.setItem('roomName', null);

                localStorage.removeItem('roomName');
                localStorage.setItem('roomName', null);
                if (socket_roomPu) { 
                    socket_roomPu.close();
                    socket_roomPu = null;
                }
                enableAllButtonsHeader();
                loadGamePrivate(roomName, pointsLimitInput.value, data);
            }
        }

        blockInteract();
    };

    socket_roomPu.onclose = function () {
        // console.log("Disconnected from room:", roomName);
    };
}


function updatePlayerColorPu(playerElement, newColor) {
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

function handlePointchangePu() {
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

function handleColorChangePu() {
    function sendColorChange(playerId, color) {
        const message = {
            type: "color_change",
            playerId: playerId,
            color: color
        };
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

function handleReadyChangePu(){
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
            if (isReady) {
                disableAllButtonsHeader();
            }
            else {
                enableAllButtonsHeader();
            }
        }
    });
    readyCheckboxPlayer2.addEventListener('change', function (e) {
        if (currentUser === playerName2.textContent.trim()) {
            const isReady = e.target.checked;
            sendReadyState('player2', isReady);
            if (isReady) {
                disableAllButtonsHeader();
            }
            else {
                enableAllButtonsHeader();
            }
        }
    });
}

function handleQuitButtonPu() {
    const leaveBtn = document.getElementById("leaveRoomButton");
    if (leaveBtn) {
        leaveBtn.addEventListener("click", () => {
            if (socket_roomPu) {
                socket_roomPu.close();
                socket_roomPu = null;
            }
            if (socket_roomP) {
                socket_roomP.close();
                socket_roomP = null;
            }
            socket_roomPu = null;
            const csrfToken = getCookie('csrftoken');
            fetch('/reset_room_session/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            }).then(response => {
                if (!response.ok) {
                    console.error('Erreur lors de la réinitialisation de la session.');
                }
            });
            roomNameGlobal = null;
            enableAllButtonsHeader()
            loadMyPage();
        });
    }
}

function handleStartButtonPu() {
    const btnReady = document.getElementById("btn-ready");

    btnReady.addEventListener('click', () => {
        socket_roomPu.send(JSON.stringify({
            type: 'start_game'
        }));
    });
}

function disableAllButtonsHeader() {
    const buttonsDiv = document.getElementById('buttons-div');
    const buttons = buttonsDiv.querySelectorAll('a, button');

    buttons.forEach(button => {
        if (button.tagName === 'BUTTON') {
            button.disabled = true;
        } else if (button.tagName === 'A') {
            button.style.pointerEvents = 'none';
            button.classList.add('disabled');
        }
    });
}