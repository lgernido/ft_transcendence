function launchTournament(maxPoints, players) {
    let isActive = false; 
    let currentMatchIndex = 0; 
    let currentRound = [...players];
    let matchPlayers = [...players];
    const barSpeed = 1.5;
    const paddleWidth = 2;
    const ballRadius = 1;
    const paddleHeight = 20;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');
    const countdownElement = document.getElementById('countdown');
    const winnerMessage = document.getElementById('winnerMessage');

    const keysPressed = { w: false, s: false, ArrowUp: false, ArrowDown: false };
    const gameState = {
        leftBarPos: 50,
        rightBarPos: 50,
        ball: { x: 50, y: 50, speedX: 0.8, speedY: 0.8 },
        leftScore: 0,
        rightScore: 0
    };

    function startMatch(player1, player2) {
        isActive = false; 
        playerLeft.innerText = player1;
        playerRight.innerText = player2;

        const roundAnnouncement = document.getElementById('roundAnnouncement');
        const ballElement = document.querySelector('.ball');
        const countdownElement = document.getElementById('countdown');

        ballElement.classList.add('hidden');
        countdownElement.style.display = 'none';

        roundAnnouncement.innerHTML = `Prochain Round:<br>${player1} VS ${player2}`;
        roundAnnouncement.style.display = 'block';

        playerLeft.classList.remove('slide-in-left');
        playerRight.classList.remove('slide-in-right');

        setTimeout(() => {
            playerLeft.classList.add('slide-in-left');
            playerRight.classList.add('slide-in-right');
        }, 500);

        setTimeout(() => {
            roundAnnouncement.style.display = 'none';
            resetGameState();
            displayCountdown(() => {
                isActive = true;
                updateGame();
            });
        }, 5000);
    }

    function resetGameState() {
        const initialSpeed = 0.8;
        const leftBar = document.querySelector('.left-barre');

        if (leftBar === null){
            isActive = false;
            return;
        };

        gameState.leftBarPos = 50;
        gameState.rightBarPos = 50;
        gameState.ball = { 
            x: 50,
            y: 50, 
            speedX: Math.random() > 0.5 ? initialSpeed : -initialSpeed,
            speedY: (Math.random() * 1.5 - 0.75)
        };
        gameState.leftScore = 0;
        gameState.rightScore = 0;

        document.querySelector('.left-barre').style.top = '50%';
        document.querySelector('.right-barre').style.top = '50%';
        document.querySelector('.ball').style.left = '50%';
        document.querySelector('.ball').style.top = '50%';
        document.getElementById('scorePLeft').innerText = 0;
        document.getElementById('scorePRight').innerText = 0;

        document.querySelector('.ball').classList.add('hidden');
    }

    function displayCountdown(callback) {
        let countdown = 5;
        const ballElement = document.querySelector('.ball');
        countdownElement.textContent = countdown;
        countdownElement.style.display = 'block';

        if (ballElement === null) {
            isActive = false;
            return;
        }

        const interval = setInterval(() => {
            countdown -= 1;
            countdownElement.textContent = countdown > 0 ? countdown : 'GO!';

            if (ballElement === null) {
                clearInterval(interval);
                isActive = false;
                return;
            }

            if (countdown <= 0) {
                if (ballElement === null) {
                    clearInterval(interval);
                    isActive = false;
                    return;
                }
                
                clearInterval(interval);
                countdownElement.style.display = 'none';
                if (ballElement) {
                    document.querySelector('.ball').classList.remove('hidden');
                } 
                callback();
            }
        }, 1000);
    }

    function updateGame() {
        if (!isActive) return;

        const scorePLeft = document.getElementById('scorePLeft');

        if (scorePLeft === null) {
            isActive = false;
            return;
        }

        if (keysPressed.w) gameState.leftBarPos = Math.max(0 + 8, gameState.leftBarPos - barSpeed);
        if (keysPressed.s) gameState.leftBarPos = Math.min(100 - 8, gameState.leftBarPos + barSpeed);
        if (keysPressed.ArrowUp) gameState.rightBarPos = Math.max(0 + 8, gameState.rightBarPos - barSpeed);
        if (keysPressed.ArrowDown) gameState.rightBarPos = Math.min(100 - 8, gameState.rightBarPos + barSpeed);

        gameState.ball.x += gameState.ball.speedX;
        gameState.ball.y += gameState.ball.speedY;

        handleBallCollision();

        document.getElementById('scorePLeft').innerText = gameState.leftScore;
        document.getElementById('scorePRight').innerText = gameState.rightScore;

        document.querySelector('.left-barre').style.top = `${gameState.leftBarPos}%`;
        document.querySelector('.right-barre').style.top = `${gameState.rightBarPos}%`;
        document.querySelector('.ball').style.left = `${gameState.ball.x}%`;
        document.querySelector('.ball').style.top = `${gameState.ball.y}%`;

        if (gameState.leftScore >= maxPoints || gameState.rightScore >= maxPoints) {
            const winner = gameState.leftScore >= maxPoints ? "left" : "right";
            displayWinner(winner);
            endMatch(winner);
        } else {
            requestAnimationFrame(updateGame);
        }
    }

    function handleBallCollision() {
        const ball = gameState.ball;
    
        if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= 100) {
            ball.speedY *= -1;
            ball.y = ball.y - ballRadius <= 0 ? ballRadius : 100 - ballRadius;
        }
    
        if (ball.x - ballRadius <= paddleWidth) {
            const distanceFromCenter = Math.abs(gameState.leftBarPos - ball.y);
            if (distanceFromCenter <= paddleHeight / 2) {
                ball.speedX *= -1.1; 
                ball.speedY += (ball.y - gameState.leftBarPos) * 0.05;
                ball.x = paddleWidth + ballRadius;
            } else {
                gameState.rightScore++;
                resetBall();
            }
        }
    
        if (ball.x + ballRadius >= 100 - paddleWidth) {
            const distanceFromCenter = Math.abs(gameState.rightBarPos - ball.y);
            if (distanceFromCenter <= paddleHeight / 2) {
                ball.speedX *= -1.1;
                ball.speedY += (ball.y - gameState.rightBarPos) * 0.05;
                ball.x = 100 - paddleWidth - ballRadius;
            } else {
                gameState.leftScore++;
                resetBall();
            }
        }
    }

    function resetBall() {
        const initialSpeed = 0.8;
        gameState.ball = {
            x: 50,
            y: 50,
            speedX: Math.random() > 0.5 ? initialSpeed : -initialSpeed,
            speedY: (Math.random() * 1.5 - 0.75)
        };
    }

    function displayWinner(winner) {
        isActive = false;

        document.querySelector('.ball').classList.add('hidden');

        const winnerName = winner === "left" ? playerLeft.innerText : playerRight.innerText;
        winnerMessage.innerText = `${winnerName} Wins!`;

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

    function endMatch(winner) {
        isActive = false;
    
        setTimeout(() => {
            winnerMessage.style.display = 'none';
    
            const winnerName = winner === "left" ? playerLeft.innerText : playerRight.innerText;
            const loserName = winner === "left" ? playerRight.innerText : playerLeft.innerText;
    
            currentRound.push(winnerName);
            currentMatchIndex++;    
    
            const loserIndex = matchPlayers.indexOf(loserName);
            if (loserIndex !== -1) {
                matchPlayers.splice(loserIndex, 1);
            }
    
            if (matchPlayers.length === 1) {
                displayWinner(winner)
                return;
            }
    
            if (currentMatchIndex * 2 >= currentRound.length) {
                currentRound = currentRound.slice(-currentRound.length / 2);
                currentMatchIndex = 0;
            }
    
            if (currentRound.length > 1) {
                startMatch(currentRound[currentMatchIndex * 2], currentRound[currentMatchIndex * 2 + 1]);
            }
        }, 3000);
    }

    // Gestion des entrées clavier
    document.addEventListener('keydown', (event) => {
        if (event.key in keysPressed) keysPressed[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
        if (event.key in keysPressed) keysPressed[event.key] = false;
    });

    startMatch(currentRound[currentMatchIndex * 2], currentRound[currentMatchIndex * 2 + 1]);
}



