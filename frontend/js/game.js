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

    function moveBall() {
        posBallX += speedX;
        posBallY += speedY;
		console.log(posBallX);
		console.log(posBallY);

        const ballRect = ball.getBoundingClientRect();
        const leftBarreRect = leftBarre.getBoundingClientRect();
        const rightBarreRect = rightBarre.getBoundingClientRect();

        // Collision cote supérieur / inférieur
        if (posBallY - 2 <= 0 || posBallY + 2 >= 100) {
            speedY *= -1;
        }

		// Collision cote gauche / droit
		if (posBallX - 1.5 <= 0 || posBallX + 1.5 >= 100) {
			speedX *= -1;
		}

        // Collision barre gauche
        if (ballRect.left <= leftBarreRect.right && ballRect.top >= leftBarreRect.top && ballRect.bottom <= leftBarreRect.bottom) {
			posBallX = posBallX + 1;
            speedX *= -1;
        }

        // Collision barre droite
        if (ballRect.right >= rightBarreRect.left && ballRect.top >= rightBarreRect.top && ballRect.bottom <= rightBarreRect.bottom) {
			posBallX = posBallX - 1;
            speedX *= -1;
        }

        ball.style.left = posBallX + '%';
        ball.style.top = posBallY + '%';
    }

    setInterval(moveBall, 10);
});