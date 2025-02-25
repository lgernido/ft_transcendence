function launchTournament(maxPoints, players) {
    let isActive = false; 
    let currentMatchIndex = 0; 
    let currentRound = [...players];
    let matchPlayers = [...players];

    const ball = document.querySelector('.ball');

	let posBallX = 50;
	let posBallY = 50;
	let speedX = 0.3;
	let speedY = 0.2;

	let ballSpeed = 0.3;

	let scrorePlayerLeft = 0;
	let scrorePlayerRight = 0;

	let resettingBall = false;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');
    const countdownElement = document.getElementById('countdown');
    const winnerMessage = document.getElementById('winnerMessage');

    function startMatch(player1, player2) {
        isActive = false; 
        playerLeft.innerText = player1;
        playerRight.innerText = player2;

        const roundAnnouncement = document.getElementById('roundAnnouncement');
        const ballElement = document.querySelector('.ball');
        const countdownElement = document.getElementById('countdown');

        ballElement.classList.add('hidden');
        countdownElement.style.display = 'none';

        roundAnnouncement.innerHTML = `Next Round:<br>${player1} VS ${player2}`;
        roundAnnouncement.style.display = 'block';

        playerLeft.classList.remove('slide-in-left');
        playerRight.classList.remove('slide-in-right');

        setTimeout(() => {
            playerLeft.classList.add('slide-in-left');
            playerRight.classList.add('slide-in-right');
        }, 500);

        setTimeout(() => {
            scrorePlayerLeft = 0;
		    scrorePlayerRight = 0;
            updateScore();
            resetBars();
            resetBall();
            roundAnnouncement.style.display = 'none';
            displayCountdown(() => {
                isActive = true;
                startGame();
            });
        }, 5000);
    }

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
	paddleInterval = setInterval(() => {
		if (keys['w']) {
			leftBarrePosition = moveBarre(leftBarre, leftBarrePosition, -moveValue);
		}
		if (keys['s']) {
			leftBarrePosition = moveBarre(leftBarre, leftBarrePosition, moveValue);
		}
		if (keys['ArrowUp']) {
			rightBarrePosition = moveBarre(rightBarre, rightBarrePosition, -moveValue);
		}
		if (keys['ArrowDown']) {
			rightBarrePosition = moveBarre(rightBarre, rightBarrePosition, moveValue);
		}
	}, 10);

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
	
    function resetBars() {
        leftBarrePosition = 50; 
        rightBarrePosition = 50;
        leftBarre.style.top = leftBarrePosition + '%';
        rightBarre.style.top = rightBarrePosition + '%';
    }

	function resetBall() {
        posBallX = 50; 
        posBallY = 50;  
        ball.style.left = posBallX + '%'; 
        ball.style.top = posBallY + '%';  

        const angle = Math.random() * Math.PI / 4 + Math.PI / 8;
        const directionX = Math.random() > 0.5 ? 1 : -1;
        const directionY = Math.random() > 0.5 ? 1 : -1;
        
        speedX = ballSpeed * Math.cos(angle) * directionX;
        speedY = ballSpeed * Math.sin(angle) * directionY;
    }

	function startGame()
	{
		scrorePlayerLeft = 0;
		scrorePlayerRight = 0;
        resettingBall = false;
		updateScore();
        // resetBars();
		resetBall();
		ballInterval = setInterval(moveBall, 10);
	}

    function toggleBallVisibility(isHidden) {
        if (isHidden) {
            ball.classList.add('hidden');
        } else {
            ball.classList.remove('hidden');
        }
    }

	async function moveBall() {
        const maxSpeed = 0.7;
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
            clearInterval(ballInterval); // Clear current ball interval before resetting
    
            ball.style.left = posBallX - 1 + '%';
            ball.style.top = posBallY - 2 + '%';
            if (posBallX - 1.5 <= 0) {
                scrorePlayerRight++;
                updateScore();
                if (scrorePlayerRight >= maxPoints) {
                    displayWinner('right');
                    endMatch('right');
                    return;
                }
            } else if (posBallX + 1.5 >= 100) {
                scrorePlayerLeft++;
                updateScore();
                if (scrorePlayerLeft >= maxPoints) {
                    displayWinner('left');
                    endMatch('left');
                    return;
                }
            }
    
            ball.classList.add('breaking');
            updateScore();
            await sleep(1000);
            ball.classList.remove('breaking');
    
            resetBall();  // Reset ball position
    
            resettingBall = false;
            ballInterval = setInterval(moveBall, 10); // Restart the ball movement interval after reset
        }
    
        ball.style.left = posBallX + '%';
        ball.style.top = posBallY + '%';
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

    startMatch(currentRound[currentMatchIndex * 2], currentRound[currentMatchIndex * 2 + 1]);
}