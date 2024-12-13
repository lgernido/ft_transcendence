

/*let socketDynamicGame;

function launchGame(roomName, maxPoints) {
    let isActive = false;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    socketDynamicGame = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/dynamic_game/${roomName}/`
    );
    if (socketDynamicGame.readyState === WebSocket.CLOSED) {
        console.log("Socket is closed");
    }

    socketDynamicGame.onopen = () => {
        console.log('Connected to the socket : ' + socketDynamicGame.url);
        socketDynamicGame.send(JSON.stringify({
            type: 'set_max_points',
            max_points: maxPoints
        }));
    };

    window.addEventListener('beforeunload', () => {
        socketDynamicGame.close();
    });

    window.addEventListener('popstate', () => {
        if (socketDynamicGame.readyState === WebSocket.OPEN) {
            socketDynamicGame.close();
        }
    });

    const targetPaths = ['/mypage', '/stats', '/amis', '/chat', '/compte'];

    const observer = new MutationObserver(() => {
        if (targetPaths.includes(window.location.pathname)) {
            if (socketDynamicGame) {
                socketDynamicGame.close();
                console.log(`WebSocket fermé car l’utilisateur est sur ${window.location.pathname}`);
            }
        }
    });

    const playerActions = { left: 0, right: 0 }; 
    const keysPressed = { w: false, s: false, ArrowUp: false, ArrowDown: false };
    const barSpeed = 1.5; 
    
    function updateBarPositions() {
        if (!isActive) return;

        if (keysPressed.w) {
            playerActions.left = -barSpeed;
            sendMove("left", -barSpeed);
        } else if (keysPressed.s) {
            playerActions.left = barSpeed;
            sendMove("left", barSpeed);
        } else {
            playerActions.left = 0;
            sendMove("left", 0);
        }

        if (keysPressed.ArrowUp) {
            playerActions.right = -barSpeed;
            sendMove("right", -barSpeed);
        } else if (keysPressed.ArrowDown) {
            playerActions.right = barSpeed;
            sendMove("right", barSpeed);
        } else {
            playerActions.right = 0;
            sendMove("right", 0);
        }

        requestAnimationFrame(updateBarPositions);
    }

    document.addEventListener('keydown', (event) => {
        if (!isActive) return;

        if (event.key === 'w' || event.key === 's' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            keysPressed[event.key] = true;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (!isActive) return;

        if (event.key === 'w' || event.key === 's' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            keysPressed[event.key] = false;
        }let socket;

        function lobby() {
            const playerName1_public = document.querySelector('.card-lobby-text-name-public-1');
            const colorSelect1_public = document.getElementById('selectColorPlayerPublic1');
            const maxPointsInput = document.getElementById('maxPoint');
        
            playerName1_public.classList.add('color-player-red');
        
            socket = new WebSocket(
                `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/lobby/`
            );
        
            socket.onopen = function() {
                console.log("WebSocket connected to the lobby");
                socket.send(JSON.stringify({
                    action: 'player_join',
                    player: playerName1_public.innerText
                }));
            }
        
            socket.onmessage = function(event) {
                const data = JSON.parse(event.data);
        
                if (data.status === 'start_game') {
                    const player1Color = document.getElementById('selectColorPlayerPublic1').value;
                    const player2Color = 'color-player-green';
                    const maxPoint = document.getElementById('maxPoint').value;
                    const roomName = data.room_name;
                    
                    fetch("create_dynamic_room/", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken'),
                        },
                        body: JSON.stringify({
                            roomName: roomName,
                            player1Color: player1Color,
                            player2Color: player2Color,
                            maxPoint: maxPoint,
                        }),
                    })
                        .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
                        .then(({ status, body }) => {
                            if (status === 200) {
                                loadGame(roomName, maxPoint);
                            } else {
                                alert(body.error || 'Failed to create room');
                            }
                        })
                        .catch((error) => {
                            console.error('Fetch error:', error);
                            alert('Failed to create room');
                    });
                    
                }
            };
        
            socket.onerror = function(error) {
                console.error('WebSocket error:', error);
            }
        
            socket.onclose = function(event) {
                console.log('WebSocket closed:', event);
            }
        
            maxPointsInput.addEventListener('input', (event) => {
                if (maxPointsInput.value < 1)
                    maxPointsInput.value = 1;
                else if (maxPointsInput.value > 40)
                    maxPointsInput.value = 40;
            });
        
            colorSelect1_public.addEventListener('change', (event) => {
                playerName1_public.classList.remove(
                    'color-player-red',
                    'color-player-green',
                    'color-player-blue',
                    'color-player-yellow',
                    'color-player-cyan',
                    'color-player-magenta',
                    'color-player-orange',
                    'color-player-purple',
                    'color-player-pink',
                    'color-player-gray',
                    'color-player-none'
                );
                playerName1_public.classList.add(event.target.value);
            });
        
            // Fonction pour récupérer le token CSRF
            function getCookie(name) {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
        }
        
    });
        
    function sendMove(player, direction) {
        socketDynamicGame.send(JSON.stringify({
            type: 'move',
            player: player,
            direction: direction
        }));
    }
    
    socketDynamicGame.onmessage = (message) => {
        const data = JSON.parse(message.data);
    
        if (data.type === "game_state" || data.type === "game_update") {
            updateGameState(data);
        } else if (data.type === "game_over") {
            displayWinner(data.winner);
            if (socketDynamicGame.readyState === WebSocket.OPEN) {
                socketDynamicGame.close();
            }
        } else if (data.type === "close_socket") {
            if (socketDynamicGame.readyState === WebSocket.OPEN) {
                socketDynamicGame.close();
            }
        }
    };
    
    function updateGameState(state) {
        let leftBar = document.querySelector('.left-barre');
        let rightBar = document.querySelector('.right-barre');

        if (leftBar === null || rightBar === null) {
            if (socketDynamicGame) {
                socketDynamicGame.close();
            }
        }

        document.querySelector('.left-barre').style.top = `${state.left_bar_pos}%`;
        document.querySelector('.right-barre').style.top = `${state.right_bar_pos}%`;
        document.querySelector('.ball').style.left = `${state.ball_pos.x}%`;
        document.querySelector('.ball').style.top = `${state.ball_pos.y}%`;
    
        document.getElementById('scorePLeft').innerText = state.left_score;
        document.getElementById('scorePRight').innerText = state.right_score;
    }

        
    function displayWinner(winner) {
        isActive = false;
        document.querySelector('.ball').classList.add('hidden');
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.innerText = winner === "left" ? "Player 1 Wins!" : "Player 2 Wins!";
        winnerMessage.style.display = 'block';
        winnerMessage.style.position = 'absolute';
        winnerMessage.style.top = '50%';
        winnerMessage.style.left = '50%';
        winnerMessage.style.transform = 'translate(-50%, -50%)';
        winnerMessage.style.fontSize = '3rem';
        winnerMessage.style.color = '#fff';
        winnerMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        winnerMessage.style.padding = '20px';
        winnerMessage.style.borderRadius = '10px';
    }
    
    const countdownElement = document.getElementById('countdown');
    let countdown = 5;
    function startCountdown() {
        countdownElement.textContent = countdown;
        countdownElement.style.display = 'block';
        const countdownInterval = setInterval(() => { 
            countdown -= 1;
            countdownElement.textContent = countdown > 0 ? countdown : 'GO!';
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
                document.querySelector('.ball').classList.remove('hidden'); 
                isActive = true;
                socketDynamicGame.send(JSON.stringify({ type: 'start_game' }));
                updateBarPositions();
            }
        }, 1000);
    }
    
    startCountdown();
}*/
