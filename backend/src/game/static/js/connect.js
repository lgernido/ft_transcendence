document.addEventListener('DOMContentLoaded', () => {
	const ball = document.getElementById("ball_connect");
	const ballSpeed = 3;
	let ballDirectionX = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1 + 0.5);
	let ballDirectionY = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1 + 0.5);

	let ballX = 100;
	let ballY = 100;

	function getRandomColor() {
		const letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	function moveBall() {
		ballX += ballDirectionX * ballSpeed;
		ballY += ballDirectionY * ballSpeed;

		if (ballX - ball.offsetWidth / 2 <= 0 || ballX + 8 + ball.offsetWidth / 2 >= window.innerWidth) {
			ballDirectionX *= -1;
			ball.style.backgroundColor = getRandomColor();
		}
		if (ballY - ball.offsetHeight / 2 <= 0 || ballY + 8 + ball.offsetHeight / 2 >= window.innerHeight) {
			ballDirectionY *= -1;
			ball.style.backgroundColor = getRandomColor();
		}
		ball.style.left = ballX + "px";
		ball.style.top = ballY + "px";

		requestAnimationFrame(moveBall);
	}

	moveBall();
});