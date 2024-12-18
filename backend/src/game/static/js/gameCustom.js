function launchGamePrivateCustom(roomName, maxPoints) {
    let isActive = false;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');
    const keysPressed = { w: false, s: false, ArrowUp: false, ArrowDown: false };
    const barSpeed = 1.5;

    const gameState = {
        leftBarPos: 50,
        rightBarPos: 50,
        ball: { x: 50, y: 50, speedX: 0.8, speedY: 0.8 },
        leftScore: 0,
        rightScore: 0,
        leftBarHeight: 10,
        rightBarHeight: 10,
    };

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    function resetGameState() {
        const initialSpeed = 0.8;
        gameState.leftBarPos = 50;
        gameState.rightBarPos = 50;
        gameState.leftBarHeight = 10;
        gameState.rightBarHeight = 10;
        gameState.ball = {
            x: 50,
            y: 50,
            speedX: Math.random() > 0.5 ? initialSpeed : -initialSpeed,
            speedY: Math.random() * 1.5 - 0.75,
        };
        gameState.leftScore = 0;
        gameState.rightScore = 0;

        updateUI();
        document.querySelector('.ballfoot').classList.add('hidden');
    }

    function updateUI() {
        const leftBar = document.querySelector('.left-barre');
        const rightBar = document.querySelector('.right-barre');
        const ball = document.querySelector('.ballfoot');

        if (leftBar && rightBar && ball) {
            leftBar.style.top = `${gameState.leftBarPos}%`;
            leftBar.style.height = `${gameState.leftBarHeight}%`;
            rightBar.style.top = `${gameState.rightBarPos}%`;
            rightBar.style.height = `${gameState.rightBarHeight}%`;
            ball.style.left = `${gameState.ball.x}%`;
            ball.style.top = `${gameState.ball.y}%`;

            document.getElementById('scorePLeft').innerText = gameState.leftScore;
            document.getElementById('scorePRight').innerText = gameState.rightScore;
        }
    }

    function updateGame() {
        if (!isActive) return;

        const leftBar = document.querySelector('.left-barre');
        const rightBar = document.querySelector('.right-barre');

        if (!leftBar || !rightBar) {
            isActive = false;
            return;
        }

        if (keysPressed.w) gameState.leftBarPos = Math.max(8, gameState.leftBarPos - barSpeed);
        if (keysPressed.s) gameState.leftBarPos = Math.min(92, gameState.leftBarPos + barSpeed);
        if (keysPressed.ArrowUp) gameState.rightBarPos = Math.max(8, gameState.rightBarPos - barSpeed);
        if (keysPressed.ArrowDown) gameState.rightBarPos = Math.min(92, gameState.rightBarPos + barSpeed);

        gameState.ball.x += gameState.ball.speedX;
        gameState.ball.y += gameState.ball.speedY;

        if (gameState.ball.y <= 2 || gameState.ball.y >= 98) {
            gameState.ball.speedY *= -1;
        }

        // Ball collision with paddles
        if (gameState.ball.x <= 2 && Math.abs(gameState.leftBarPos - gameState.ball.y) < 10) {
            gameState.ball.speedX *= -1;
            gameState.leftBarHeight = Math.min(gameState.leftBarHeight + 2, 30);
        }
        if (gameState.ball.x >= 98 && Math.abs(gameState.rightBarPos - gameState.ball.y) < 10) {
            gameState.ball.speedX *= -1;
            gameState.rightBarHeight = Math.min(gameState.rightBarHeight + 2, 30);
        }

        if (gameState.ball.x <= 0) {
            gameState.rightScore++;
            resetBall();
        } else if (gameState.ball.x >= 100) {
            gameState.leftScore++;
            resetBall();
        }

        updateUI();

        if (gameState.leftScore >= maxPoints || gameState.rightScore >= maxPoints) {
            const winner = gameState.leftScore >= maxPoints ? "left" : "right";
            displayWinner(winner);
            isActive = false;
        } else {
            requestAnimationFrame(updateGame);
        }
    }

    function resetBall() {
        const initialSpeed = 0.8;
        gameState.ball = {
            x: 50,
            y: 50,
            speedX: Math.random() > 0.5 ? initialSpeed : -initialSpeed,
            speedY: Math.random() * 1.5 - 0.75,
        };

        gameState.leftBarHeight = 10;
        gameState.rightBarHeight = 10;

        updateUI();
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
            if (countdown <= 0) {
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
