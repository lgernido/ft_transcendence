let socketBOT;

function launchGameBot(roomName, maxPoints) {
    let isActive = false;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    playerRight.innerHTML = 'OpenAI';

    const selectRightBar = document.querySelector('.right-barre');
    selectRightBar.classList.add('bar-transition');

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    socketBOT = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/game/${roomName}/`
    );
    if (socketBOT.readyState === WebSocket.CLOSED) {
    }

    socketBOT.onopen = () => {
        socketBOT.send(JSON.stringify({
            type: 'set_max_points',
            max_points: maxPoints
        }));
    };

    function sendStopGame() {
        if (socketBOT.readyState !== WebSocket.OPEN) {
            return;
        }
        socketBOT.send(JSON.stringify({ type: 'stop_game' }));
        isActive = false;
    }

    window.addEventListener('beforeunload', () => {
        sendStopGame();
        socketBOT.close();
    });

    window.addEventListener('popstate', () => {
        if (socketBOT.readyState === WebSocket.OPEN) {
            sendStopGame();
            socketBOT.close();
        }
    });

    const targetPaths = ['/mypage', '/stats', '/amis', '/chat', '/compte'];

    const observer = new MutationObserver(() => {
        if (targetPaths.includes(window.location.pathname)) {
            if (socketBOT) {
                sendStopGame();
                socketBOT.close();
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
        const ball = document.querySelector('.ball');

        if (leftBar === null || rightBar === null) {
            if (socketBOT) {
                sendStopGame();
                socketBOT.close();
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

        const ballTop = parseFloat(ball.style.top);
        const rightBarTop = parseFloat(rightBar.style.top);

        if (ballTop > rightBarTop + 3) {
            playerActions.right = barSpeed;
            sendMove("right", barSpeed);
        }
        else if (ballTop < rightBarTop - 3) {
            playerActions.right = -barSpeed;
            sendMove("right", -barSpeed);
        }
        else {
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
        if (socketBOT.readyState !== WebSocket.OPEN) {
            return;
        }

        socketBOT.send(JSON.stringify({
            type: 'move',
            player: player,
            direction: direction
        }));
    }
    
    socketBOT.onclose = (event) => {
    }
    
    socketBOT.onmessage = (message) => {
        const data = JSON.parse(message.data);
    
        if (data.type === "game_state" || data.type === "game_update") {
            updateGameState(data);
        } else if (data.type === "game_over") {
            displayWinner(data.winner);
            if (socketBOT.readyState === WebSocket.OPEN) {
                socketBOT.send(JSON.stringify({ type: 'over_game', winner: data.winner, user1: playerLeft.innerText, user2: playerRight.innerText }));
                setTimeout(() => {
                    sendStopGame();
                    socketBOT.close();
                }, 5000);
            }
        } else if (data.type === "close_socket") {
            if (socketBOT.readyState === WebSocket.OPEN) {
                sendStopGame();
                socketBOT.close();
            }
        }
    };
    
    function updateGameState(state) {
        const leftBar = document.querySelector('.left-barre');
        const rightBar = document.querySelector('.right-barre');

        if (leftBar === null || rightBar === null) {
            if (socketBOT) {
                sendStopGame();
                socketBOT.close();
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
        winnerMessage.innerText = winner === "left" ? "Player 1 Wins!" : "OpenAI Wins!";
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
                const ball = document.querySelector('.ball');

                if (ball === null) {
                    if (socketBOT) {
                        sendStopGame();
                        socketBOT.close();
                    }
                    clearInterval(countdownInterval);

                    return;
                }

                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
                document.querySelector('.ball').classList.remove('hidden'); 
                isActive = true;
                socketBOT.send(JSON.stringify({ type: 'start_game' }));
                updateBarPositions();
            }
        }, 1000);
    }
    
    startCountdown();
}
