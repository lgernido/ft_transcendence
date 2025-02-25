function launchGameBot(maxPoints, colorP1, colorP2) {
    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    if (!playerLeft || !playerRight)
        return

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);

    const leftBarre = document.querySelector('.left-barre');
    const rightBarre = document.querySelector('.right-barre');

    if (!leftBarre || !rightBarre)
        return

    updatePlayerColorG(leftBarre, rightBarre, colorP1, colorP2);

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
    
    const ball = document.querySelector('.ball');
    const ballRadius = 2;
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
    const maxAngle = Math.PI / 4;

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
        const directionY = Math.random() > 0.5 ? 1 : -1;
        
        speedX = ballSpeed * Math.cos(angle) * directionX;
        speedY = ballSpeed * Math.sin(angle) * directionY;
    }

    var aiBar = { y: rightBarrePosition, height: barreHeight };
    let predictedBallY = posBallY;

    function aiMove() {
        let difference = predictedBallY - aiBar.y;
    
        const maxMove = barreSpeed/2;
    
        if (Math.abs(difference) > maxMove) {
            aiBar.y += Math.sign(difference) * maxMove;
        } else {
            aiBar.y = predictedBallY;
        }
    
        aiBar.y = Math.max(barreHeight / 2, Math.min(100 - barreHeight / 2, aiBar.y));
    
        rightBarre.style.top = aiBar.y + '%';
    }
    
    function predict_ball_position() {
        let bx = posBallX;
        let by = posBallY;
        let bdx = speedX;
        let bdy = speedY;
        
        for (let i = 0; i < 100; i++) {
            bx += bdx;
            by += bdy;
            
            if (by + 1 >= 100 || by - 1 <= 0) {
                bdy = -bdy * getRandomNumber(0.6, 1.4);
                by += bdy;
            }
            
            if (bx + 1 >= 100 - 5) {
                bx = 100 - 5;
                break;
            }
            
            if (bx - 1 <= 5) {
                bdx = -bdx * getRandomNumber(0.6, 1.4);
                bx += bdx;
            }
        }
        predictedBallY = by;
    }
    
    paddleInterval = setInterval(() => {
        if (keys['w']) {
            leftBarrePosition = moveBarre(leftBarre, leftBarrePosition, -moveValue);
        }
        if (keys['s']) {
            leftBarrePosition = moveBarre(leftBarre, leftBarrePosition, moveValue);
        }

    }, 10);

    calcIaInterval = setInterval(predict_ball_position, 1000);

    moveIaInterval = setInterval(aiMove, 10);

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
    }

    function toggleBallVisibility(isHidden) {
        if (isHidden) {
            ball.classList.add('hidden');
        } else {
            ball.classList.remove('hidden');
        }
    }

    async function moveBall() {
        const maxSpeed = 0.8;
        posBallX += speedX;
        posBallY += speedY;

        const ballRect = ball.getBoundingClientRect();
        const leftBarreRect = leftBarre.getBoundingClientRect();
        const rightBarreRect = rightBarre.getBoundingClientRect();

        if (resettingBall) return;

        if (posBallY - ballRadius <= 0 || posBallY + ballRadius >= 100)
            speedY *= -1;

        if (ballRect.left <= leftBarreRect.right && ballRect.bottom >= leftBarreRect.top && ballRect.top <= leftBarreRect.bottom)
        {
            posBallX = posBallX + 1;

            const impactPoint = (ballRect.top + ballRect.height / 2 - leftBarreRect.top) / leftBarreRect.height;
            const angle = calculateAngle(impactPoint, maxAngle);

            const totalSpeed = Math.hypot(speedX, speedY) * increaseSpeed;
            if (totalSpeed < maxSpeed)
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
            if (totalSpeed < maxSpeed)
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
                updateScore();
                if (scrorePlayerRight >= maxPoints) {
                    displayWinner('right');
                    return;
                }
            } else if (posBallX + 1.5 >= 100) {
                scrorePlayerLeft++;
                updateScore();
                if (scrorePlayerLeft >= maxPoints) {
                    displayWinner('left');
                    return;
                }
            }

            ball.classList.add('breaking');
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

function updatePlayerColorG(playerElement1, playerElement2, newColor1, newColor2) {
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
    
    if (playerElement1 && playerElement2) {
        playerElement1.classList.remove(...colorClasses);
        playerElement2.classList.remove(...colorClasses);

        if (newColor1) {
            playerElement1.classList.add(newColor1);
        }
        if (newColor2) {
            playerElement2.classList.add(newColor2);
        }
    }
}