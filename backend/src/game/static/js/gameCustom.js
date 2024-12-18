function launchGamePrivateCustom(roomName, maxPoints) {
    let isActive = false;
    const paddleWidth = 2; 
    const ballRadius = 1;  

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');
    const keysPressed = { w: false, s: false, ArrowUp: false, ArrowDown: false };
    const barSpeed = 1.5;

    const paddleHeight = 20;

    const gameState = {
        leftBarPos: 50,
        rightBarPos: 50,
        ball: { x: 50, y: 50, speedX: 0.5, speedY: 0.5 },
        leftScore: 0,
        rightScore: 0
    };

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    function resetGameState() {
        const initialSpeed = 0.5;
        gameState.leftBarPos = 50;
        gameState.rightBarPos = 50;
        gameState.ball = { 
            x: 50, 
            y: 50, 
            speedX: Math.random() > 0.5 ? initialSpeed : -initialSpeed, 
            speedY: Math.random() * 1.5 - 0.75 
        };
        gameState.leftScore = 0;
        gameState.rightScore = 0;

        document.querySelector('.left-barre').style.top = '50%';
        document.querySelector('.right-barre').style.top = '50%';
        document.querySelector('.ballfoot').style.left = '50%';
        document.querySelector('.ballfoot').style.top = '50%';
        document.getElementById('scorePLeft').innerText = 0;
        document.getElementById('scorePRight').innerText = 0;

        document.querySelector('.ballfoot').classList.add('hidden');
    }

    function handleBallCollision() {
        const ball = gameState.ball;
    
        if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= 100) {
            ball.speedY *= -1;
            ball.y = ball.y - ballRadius <= 0 ? ballRadius : 100 - ballRadius; // Ajuster la position
        }
    
        if (ball.x - ballRadius <= paddleWidth) {
            const distanceFromCenter = Math.abs(gameState.leftBarPos - ball.y);
            if (distanceFromCenter <= paddleHeight / 2) {
                ball.speedX *= -1.1; 
                ball.speedY += (ball.y - gameState.leftBarPos) * 0.05;
                ball.x = paddleWidth + ballRadius; // Ajuste la position pour éviter le chevauchement
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
                ball.x = 100 - paddleWidth - ballRadius; // Ajuste la position pour éviter le chevauchement
            } else {
                gameState.leftScore++;
                resetBall();
            }
        }
    }
    

    function updateGame() {
        if (!isActive) return;

        const leftBar = document.querySelector('.left-barre');
        const rightBar = document.querySelector('.right-barre');

        if (!leftBar || !rightBar) {
            isActive = false;
            return;
        };

        if (keysPressed.w) gameState.leftBarPos = Math.max(8, gameState.leftBarPos - barSpeed);
        if (keysPressed.s) gameState.leftBarPos = Math.min(92, gameState.leftBarPos + barSpeed);
        if (keysPressed.ArrowUp) gameState.rightBarPos = Math.max(8, gameState.rightBarPos - barSpeed);
        if (keysPressed.ArrowDown) gameState.rightBarPos = Math.min(92, gameState.rightBarPos + barSpeed);

        gameState.ball.x += gameState.ball.speedX;
        gameState.ball.y += gameState.ball.speedY;

        handleBallCollision();

        if (gameState.ball.x <= 0) {
            gameState.rightScore++;
            resetBall();
        } else if (gameState.ball.x >= 100) {
            gameState.leftScore++;
            resetBall();
        }

        document.getElementById('scorePLeft').innerText = gameState.leftScore;
        document.getElementById('scorePRight').innerText = gameState.rightScore;

        document.querySelector('.left-barre').style.top = `${gameState.leftBarPos}%`;
        document.querySelector('.right-barre').style.top = `${gameState.rightBarPos}%`;
        document.querySelector('.ballfoot').style.left = `${gameState.ball.x}%`;
        document.querySelector('.ballfoot').style.top = `${gameState.ball.y}%`;

        if (gameState.leftScore >= maxPoints || gameState.rightScore >= maxPoints) {
            const winner = gameState.leftScore >= maxPoints ? "left" : "right";
            displayWinner(winner);
            isActive = false;
        } else {
            requestAnimationFrame(updateGame);
        }
    }

    function resetBall() {
        const initialSpeed = 0.5;
        gameState.ball = { 
            x: 50, 
            y: 50, 
            speedX: Math.random() > 0.5 ? initialSpeed : -initialSpeed, 
            speedY: Math.random() * 1.5 - 0.75 
        };
    }

    function displayWinner(winner) {
        isActive = false;
        document.querySelector('.ballfoot').classList.add('hidden');

        const winnerName = winner === "left" ? playerLeft.innerText : playerRight.innerText;

        const winnerMessage = document.getElementById('winnerMessage');
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

        sendGameResults(winnerName);
    }

    function sendGameResults(winnerName) {
        const data = {
            winner: winnerName,
            playerLeft: playerLeft.innerText,
            playerRight: playerRight.innerText,
            leftScore: gameState.leftScore,
            rightScore: gameState.rightScore,
        };
        console.log('Sending game results to the backend:', data);
        fetch('/api/game-results/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(), // Ensure CSRF handling is in place
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Game results successfully sent to the backend:', data);
        })
        .catch((error) => {
            console.error('Error sending game results to the backend:', error);
        });
    }

    function getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        return csrfToken;
    }

    const countdownElement = document.getElementById('countdown');
    function startCountdown() {
        let countdown = 5;
        countdownElement.textContent = countdown;
        countdownElement.style.display = 'block';

        const interval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown > 0 ? countdown : 'GO!';

            const ball = document.querySelector('.ballfoot');

            if (ball === null) {
                isActive = false;
                clearInterval(interval);
                return;
            }

            if (countdown <= 0) {
                if (ball === null) {
                    isActive = false;
                    clearInterval(interval);
                    return;
                }
                clearInterval(interval);
                countdownElement.style.display = 'none';
                document.querySelector('.ballfoot').classList.remove('hidden');
                isActive = true;
                updateGame();
            }
        }, 1000);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key in keysPressed) keysPressed[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.key in keysPressed) keysPressed[event.key] = false;
    });

    resetGameState();
    startCountdown();
}