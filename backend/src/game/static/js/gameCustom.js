function launchGamePrivateCustom(maxPoints, colorP1, colorP2) {
	let ballInterval;
	let countdownInterval;

    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    setTimeout(() => {
		playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);
	
	const leftBarre = document.querySelector('.left-barre');
	const rightBarre = document.querySelector('.right-barre');

	updatePlayerColorGc(leftBarre, rightBarre, colorP1, colorP2);

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


	const ball = document.querySelector('.ballfoot');
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
		if (scrorePlayerLeft) {
			document.getElementById("scorePLeft").textContent = scrorePlayerLeft;
		}
		if (scrorePlayerRight) {
			document.getElementById("scorePRight").textContent = scrorePlayerRight;
		}
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
	
	function startGame()
	{
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

function updatePlayerColorGc(playerElement1, playerElement2, newColor1, newColor2) {
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
	if (playerElement1)
    	playerElement1.classList.remove(...colorClasses);
	if (playerElement2)
		playerElement2.classList.remove(...colorClasses);

    if (newColor1) {
        playerElement1.classList.add(newColor1);
    }
	if (newColor2) {
        playerElement2.classList.add(newColor2);
    }
}