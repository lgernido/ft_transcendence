function launchGamePrivate() {
    let isActive = false;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    const socket = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/game/`
    );
    if (socket.readyState === WebSocket.CLOSED) {
        console.log("Socket is closed");
    }
    const playerActions = { left: 0, right: 0 }; 
    const barSpeed = 5; 
    
    document.addEventListener('keydown', (event) => {
        if (!isActive) return;

        switch (event.key) {
            case 'w':
                playerActions.left = -barSpeed;
                sendMove("left", -barSpeed);
                break;
            case 's':
                playerActions.left = barSpeed;
                sendMove("left", barSpeed);
                break;
            case 'ArrowUp':
                playerActions.right = -barSpeed;
                sendMove("right", -barSpeed);
                break;
            case 'ArrowDown':
                playerActions.right = barSpeed;
                sendMove("right", barSpeed);
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (!isActive) return;

        switch (event.key) {
            case 'w':
            case 's':
                playerActions.left = 0;
                sendMove("left", 0);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                playerActions.right = 0;
                sendMove("right", 0);
                break;
        }
    });

        
    function sendMove(player, direction) {
        socket.send(JSON.stringify({
            type: 'move',
            player: player,
            direction: direction
        }));
    }
    
    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
    
        if (data.type === "game_state" || data.type === "game_update") {
            updateGameState(data);
        } else if (data.type === "game_over") {
            displayWinner(data.winner);
        }
    };
    
    function updateGameState(state) {
        document.querySelector('.left-barre').style.top = `${state.left_bar_pos}%`;
        document.querySelector('.right-barre').style.top = `${state.right_bar_pos}%`;
        document.querySelector('.ball').style.left = `${state.ball_pos.x}%`;
        document.querySelector('.ball').style.top = `${state.ball_pos.y}%`;
    
        document.getElementById('scorePLeft').innerText = state.left_score;
        document.getElementById('scorePRight').innerText = state.right_score;
    }

        
    function displayWinner(winner) {
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.innerText = winner === "left" ? "Player 1 Wins!" : "Player 2 Wins!";
        winnerMessage.style.display = 'block';
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
                isActive = true;
                socket.send(JSON.stringify({ type: 'start_game' }));
            }
        }, 1000);
    }
    
    startCountdown();
}