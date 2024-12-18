let socketPrivate;

function launchGamePrivate(roomName, maxPoints) {
    let isActive = false;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    socketPrivate = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/game/${roomName}/`
    );
    if (socketPrivate.readyState === WebSocket.CLOSED) {
    }

    socketPrivate.onopen = () => {
        socketPrivate.send(JSON.stringify({
            type: 'set_max_points',
            max_points: maxPoints
        }));
    };

    function sendStopGame() {
        if (socketPrivate.readyState !== WebSocket.OPEN) {
            return;
        }
        socketPrivate.send(JSON.stringify({ type: 'stop_game' }));
        isActive = false;
    }

    window.addEventListener('beforeunload', () => {
        sendStopGame();
        socketPrivate.close();
    });

    window.addEventListener('popstate', () => {
        if (socketPrivate.readyState === WebSocket.OPEN) {
            sendStopGame();
            socketPrivate.close();
        }
    });

    const targetPaths = ['/mypage', '/stats', '/amis', '/chat', '/compte'];

    const observer = new MutationObserver(() => {
        if (targetPaths.includes(window.location.pathname)) {
            if (socketPrivate) {
                sendStopGame();
                socketPrivate.close();
            }
        }
    });

    const playerActions = { left: 0, right: 0 }; 
    const keysPressed = { w: false, s: false, ArrowUp: false, ArrowDown: false };
    const barSpeed = 1.5; 
    
    function updateBarPositions() {
        if (!isActive) return;

        const leftBar = document.querySelector('.left-barre');
        const rightBar = document.querySelector('.right-barre');

        if (leftBar === null || rightBar === null) {
            if (socketPrivate) {
                sendStopGame();
                socketPrivate.close();
            }
        } 

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
        }
    });
        
    function sendMove(player, direction) {
        if (socketPrivate.readyState !== WebSocket.OPEN) {
            return;
        }

        socketPrivate.send(JSON.stringify({
            type: 'move',
            player: player,
            direction: direction
        }));
    }
    
    socketPrivate.onclose = (event) => {
    }
    
    socketPrivate.onmessage = (message) => {
        const data = JSON.parse(message.data);
    
        if (data.type === "game_state" || data.type === "game_update") {
            updateGameState(data);
        } else if (data.type === "game_over") {
            displayWinner(data.winner);
            if (socketPrivate.readyState === WebSocket.OPEN) {
                socketPrivate.send(JSON.stringify({ type: 'over_game', winner: data.winner, user1: playerLeft.innerText, user2: playerRight.innerText }));
                setTimeout(() => {
                    sendStopGame();
                    socketPrivate.close();
                }, 500);
            }
        } else if (data.type === "close_socket") {
            if (socketPrivate.readyState === WebSocket.OPEN) {
                sendStopGame();
                socketPrivate.close();
            }
        }
    };
    
    function updateGameState(state) {
        const leftBar = document.querySelector('.left-barre');
        const rightBar = document.querySelector('.right-barre');

        if (leftBar === null || rightBar === null) {
            if (socketPrivate) {
                sendStopGame();
                socketPrivate.close();
            }
            return;
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
            const ball2 = document.querySelector('.ball');

                if (ball2 === null) {
                    if (socketPrivate) {
                        sendStopGame();
                        socketPrivate.close();
                    }

                    clearInterval(countdownInterval);

                    return;
                }
            
            if (countdown <= 0) {
                const ball = document.querySelector('.ball');

                if (ball === null) {
                    if (socketPrivate) {
                        sendStopGame();
                        socketPrivate.close();
                    }

                    clearInterval(countdownInterval);

                    return;
                }

                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
                document.querySelector('.ball').classList.remove('hidden'); 
                isActive = true;
                socketPrivate.send(JSON.stringify({ type: 'start_game' }));
                updateBarPositions();
            }
        }, 1000);
    }
    
    startCountdown();
}
