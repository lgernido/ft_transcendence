function launchGameBot(roomName, maxPoints) {
    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    const leftBarre = document.querySelector('.left-barre');
    const rightBarre = document.querySelector('.right-barre');

    let leftBarrePosition = 50;
    let rightBarrePosition = 50;

    const barreSpeed = 1;
    const barreHeight = 15;

    const keys = {}; 

    function moveBarre(barre, position, direction) {
        const maxPosition = 100 - (barreHeight * 0.5);
        position += direction * barreSpeed;
        position = Math.max(barreHeight * 0.5, Math.min(maxPosition, position));
        barre.style.top = position + '%';
        return position;
    }

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    const moveValue = 0.5;
    setInterval(() => {
        if (keys['w']) {
            leftBarrePosition = moveBarre(leftBarre, leftBarrePosition, -moveValue);
        }
        if (keys['s']) {
            leftBarrePosition = moveBarre(leftBarre, leftBarrePosition, moveValue);
        }

        // Déplacer l'IA pour la barre de droite (remplacer les touches fléchées par la logique de l'IA)
        aiMove();
    }, 10);

    const ball = document.querySelector('.ball');
    const gameSetup = document.querySelector('.game-window');

    let posBallX = 50;
    let posBallY = 50;
    let speedX = 0.3;
    let speedY = 0.2;

    let ballSpeed = 0.3;

    let scrorePlayerLeft = 0;
    let scrorePlayerRight = 0;

    let resettingBall = false;

    const increaseSpeed = 1.1;
    const maxAngle = Math.PI / 4; // angle max

    function calculateAngle(impactPoint, maxAngle) {
        return maxAngle * (2 * impactPoint - 1);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateScore() {
        document.getElementById("scorePLeft").textContent = scrorePlayerLeft;
        document.getElementById("scorePRight").textContent = scrorePlayerRight;
    }

    updateScore();
    
    function resetBall()
    {
        posBallX = 50;
        posBallY = 50;
        const angle = Math.random() * Math.PI / 4 + Math.PI / 8;
        const directionX = Math.random() > 0.5 ? 1 : -1;
        const directionY = 0;
        
        speedX = ballSpeed * Math.cos(angle) * directionX;
        speedY = ballSpeed * Math.sin(angle) * directionY;
    }

    var aiBar = { y: rightBarrePosition, height: barreHeight };
    var lastTiming = null;
    var posY = 50;

    function aiMove() {
        if (lastTiming === null || (Date.now() - lastTiming > 1000)) {
            lastTiming = Date.now();
            posY = predict_ball_position({x: posBallX, y: posBallY, speedX: speedX, speedY: speedY});   
        }
        let difference = posY - (aiBar.y + aiBar.height / 2);

        if (Math.abs(difference) > barreSpeed) {
            aiBar.y += Math.sign(difference) * barreSpeed;
        } else {
            aiBar.y = posY - aiBar.height / 2;
        }

        aiBar.y = Math.max(barreHeight / 2, Math.min(100 - barreHeight / 2, aiBar.y));

        rightBarrePosition = aiBar.y;
        rightBarre.style.top = rightBarrePosition + '%';
    }

    function predict_ball_position(ball) {
        let bx = ball.x;
        let by = ball.y;
        let bdx = ball.speedX;
        let bdy = ball.speedY;

        while (1) {
            bx += bdx;
            by += bdy;
    
            if (by + 1 >= 100 || by - 1 <= 0) {
                bdy = -bdy * getRandomNumber(0.6, 1.4);
                by += bdy;
            } else if (bx - 1 <= 5) {
                bdx = -bdx * getRandomNumber(0.6, 1.4);
                bx += bdx;
            } else if (bx + 1 >= 100 - 5) {
                return by;
            }
        }
        return by;
    }

    function getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function startGame() {
        scrorePlayerLeft = 0;
        scrorePlayerRight = 0;
        updateScore();
        resetBall();
        ballInterval = setInterval(moveBall, 10);
    }

    const countdownElement = document.getElementById('countdown');
    let countdown = 5;
    function startCountdown() {
        toggleBallVisibility(true);
        countdownElement.textContent = countdown;
        const countdownInterval = setInterval(() => { 
            countdown -= 1;
            countdownElement.textContent = countdown > 0 ? countdown : 'GO!';
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
                toggleBallVisibility(false);
                startGame();
            }
        }, 1000);
    }

    function sendGameResults(winnerName) {
        const data = {
            winner: winnerName,
            playerLeft: playerLeft.innerText,
            playerRight: playerRight.innerText,
            leftScore: scrorePlayerLeft,
            rightScore: scrorePlayerRight,
        };
        console.log('Sending game results to the backend:', data);
        fetch('/api/game-results/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
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

    function displayWinner(winner) {
        isActive = false;
        toggleBallVisibility(true);
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

    function toggleBallVisibility(isHidden) {
        if (isHidden) {
            ball.classList.add('hidden');
        } else {
            ball.classList.remove('hidden');
        }
    }

    async function moveBall() {
        posBallX += speedX;
        posBallY += speedY;

        const ballRect = ball.getBoundingClientRect();
        const leftBarreRect = leftBarre.getBoundingClientRect();
        const rightBarreRect = rightBarre.getBoundingClientRect();

        if (resettingBall) return;

        if (posBallY - 2 <= 0 || posBallY + 2 >= 100)
            speedY *= -1;

        if (ballRect.left <= leftBarreRect.right && ballRect.bottom >= leftBarreRect.top && ballRect.top <= leftBarreRect.bottom)
        {
            posBallX = posBallX + 1;

            const impactPoint = (ballRect.top + ballRect.height / 2 - leftBarreRect.top) / leftBarreRect.height;
            const angle = calculateAngle(impactPoint, maxAngle);

            const totalSpeed = Math.hypot(speedX, speedY) * increaseSpeed;
            speedX = Math.cos(angle) * totalSpeed;
            speedY = Math.sin(angle) * totalSpeed;

            speedX = Math.abs(speedX);
        }

        if (ballRect.right >= rightBarreRect.left && ballRect.bottom >= rightBarreRect.top && ballRect.top <= rightBarreRect.bottom)
        {
            posBallX = posBallX - 1;

            const impactPoint = (ballRect.top + ballRect.height / 2 - rightBarreRect.top) / rightBarreRect.height;
            const angle = calculateAngle(impactPoint, maxAngle);
        
            const totalSpeed = Math.hypot(speedX, speedY) * increaseSpeed;
            speedX = Math.cos(angle) * totalSpeed;
            speedY = Math.sin(angle) * totalSpeed;
        
            speedX = -Math.abs(speedX);
        }

        if (posBallX - 1 <= 0 || posBallX + 1 >= 100)
        {
            resettingBall = true;
            clearInterval(ballInterval);

            ball.style.left = posBallX - 1 + '%';
            ball.style.top = posBallY - 2 + '%';
            if (posBallX - 1.5 <= 0) {
                scrorePlayerRight++;
                if (scrorePlayerRight >= maxPoints) {
                    displayWinner('right');
                    return;
                }
            } else if (posBallX + 1.5 >= 100) {
                scrorePlayerLeft++;
                if (scrorePlayerLeft >= maxPoints) {
                    displayWinner('left');
                    return;
                }
            }

            ball.classList.add('breaking');
            updateScore();
            await sleep(1000);
            ball.classList.remove('breaking')
            resetBall();
            resettingBall = false;
            ballInterval = setInterval(moveBall, 10);
        }

        ball.style.left = posBallX + '%';
        ball.style.top = posBallY + '%';
    }

    startCountdown();
}
