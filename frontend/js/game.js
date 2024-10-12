// srcipt affichage pseudo
document.addEventListener('DOMContentLoaded', () => {
    const playerLeft = document.getElementById('playerLeft');
    const playerRight = document.getElementById('playerRight');

    setTimeout(() => {
        playerLeft.classList.add('slide-in-left');
        playerRight.classList.add('slide-in-right');
    }, 500);
});

document.addEventListener('DOMContentLoaded', () => {
	const leftBarre = document.querySelector('.left-barre');
	const rightBarre = document.querySelector('.right-barre');

	let leftBarrePosition = 50;
	let rightBarrePosition = 50;

	const barreSpeed = 1;
	const barreHeight = 15;
	
	const keys = {}; // Stock etat des touches

	function moveBarre(barre, position, direction) {
		const maxPosition = 100 - (barreHeight * 0.5);
		position += direction * barreSpeed;
		position = Math.max(barreHeight * 0.5, Math.min(maxPosition, position));
		barre.style.top = position + '%';
		return position;
	}

	// Écoute pour les touches enfoncées
	document.addEventListener('keydown', (e) => {
		keys[e.key] = true;
	});

	// Écoute pour les touches relâchées
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
		if (keys['ArrowUp']) {
			rightBarrePosition = moveBarre(rightBarre, rightBarrePosition, -moveValue);
		}
		if (keys['ArrowDown']) {
			rightBarrePosition = moveBarre(rightBarre, rightBarrePosition, moveValue);
		}
	}, 10);
});

document.addEventListener('DOMContentLoaded', () => {
	const ball = document.querySelector('.ball');
	const gameSetup = document.querySelector('.game-window');
	const leftBarre = document.querySelector('.left-barre');
	const rightBarre = document.querySelector('.right-barre');

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
		console.log("Init/reset ball");
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
		console.log("Start countdown");
        countdownElement.textContent = countdown;
        const countdownInterval = setInterval(() => { 
            countdown -= 1;
            countdownElement.textContent = countdown > 0 ? countdown : 'GO!';
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
				startGame();
            }
        }, 1000);
    }

	async function moveBall() {
		posBallX += speedX;
		posBallY += speedY;

		const ballRect = ball.getBoundingClientRect();
		const leftBarreRect = leftBarre.getBoundingClientRect();
		const rightBarreRect = rightBarre.getBoundingClientRect();

		if (resettingBall) return;

		// Collision haut / bas
		if (posBallY - 2 <= 0 || posBallY + 2 >= 100)
			speedY *= -1;

		// Collision barre
		if (ballRect.left <= leftBarreRect.right && ballRect.bottom >= leftBarreRect.top && ballRect.top <= leftBarreRect.bottom && ballRect.bottom >= leftBarreRect.top && ballRect.top <= leftBarreRect.bottom)
		{
			console.log("touch Left barre");
			posBallX = posBallX + 1;

			const impactPoint = (ballRect.top + ballRect.height / 2 - leftBarreRect.top) / leftBarreRect.height;
			const angle = calculateAngle(impactPoint, maxAngle);

			const totalSpeed = Math.hypot(speedX, speedY) * increaseSpeed;
			speedX = Math.cos(angle) * totalSpeed;
			speedY = Math.sin(angle) * totalSpeed;

			speedX = Math.abs(speedX);
		}

		if (ballRect.right >= rightBarreRect.left && ballRect.bottom >= rightBarreRect.top && ballRect.top <= rightBarreRect.bottom && ballRect.bottom >= rightBarreRect.top && ballRect.top <= rightBarreRect.bottom)
		{
			console.log("touch Right barre");
			posBallX = posBallX - 1;

			const impactPoint = (ballRect.top + ballRect.height / 2 - rightBarreRect.top) / rightBarreRect.height;
			const angle = calculateAngle(impactPoint, maxAngle);
		
			const totalSpeed = Math.hypot(speedX, speedY) * increaseSpeed;
			speedX = Math.cos(angle) * totalSpeed;
			speedY = Math.sin(angle) * totalSpeed;
		
			speedX = -Math.abs(speedX);
		}

		// Collision droit/gauche
		if (posBallX - 1.5 <= 0 || posBallX + 1.5 >= 100)
		{
			resettingBall = true;
			clearInterval(ballInterval);

			ball.style.left = posBallX - 1.5 + '%';
			ball.style.top = posBallY - 2 + '%';
			if (posBallX - 1.5 <= 0) {
				scrorePlayerRight++;
			} else if (posBallX + 1.5 >= 100) {
				scrorePlayerLeft++;
			}

			// ball.classList.add('disappearing');
			ball.classList.add('breaking');
			updateScore();
			await sleep(1000);
			ball.classList.remove('disappearing');
			ball.classList.remove('breaking')
			resetBall();
			resettingBall = false;
			ballInterval = setInterval(moveBall, 10);
		}

		ball.style.left = posBallX + '%';
		ball.style.top = posBallY + '%';
	}

	startCountdown();
});