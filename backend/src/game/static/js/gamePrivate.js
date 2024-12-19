function launchGamePrivate(roomName, maxPoints) {
	
	// Inititialision du canva
	var canvas = document.getElementById('pong');
	canvas.width = window.innerWidth * 0.75;
	canvas.height = window.innerHeight  * 0.5;

	// Appliquer du style
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	
	// Ball
	function drawBall() {
		var ballRadius = 10;
		var ballX = canvas.width / 2;
		var ballY = canvas.height / 2;
		var ballSpeedX = 2;
		var ballSpeedY = 2;
		ctx.beginPath();
		ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false);
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.closePath();
	}

	
	// Barre
	function drawBarre() {
    // Dimensions communes aux deux barres
    var barWidth = canvas.height * 0.20; // Hauteur de la barre
    var barHeight = canvas.height * 0.01; // Largeur de la barre
    var barY = (canvas.height - barWidth) / 2; // Centrée verticalement

    // Player droite (barre à droite)
    var barXRight = canvas.width - barHeight - (0.01 * canvas.width); // Position à droite
    ctx.fillStyle = 'blue';
    ctx.fillRect(barXRight, barY, barHeight, barWidth);

    // Player gauche (barre à gauche)
    var barXLeft = 0.01 * canvas.width; // Position à gauche
    ctx.fillStyle = 'red'; // Une couleur différente pour la barre gauche
    ctx.fillRect(barXLeft, barY, barHeight, barWidth);
}
	
	drawBall();
	drawBarre();
	
	// Modification des variables en fontion de la taille de l'ecran
	window.addEventListener('resize', function() {
		canvas.width = window.innerWidth * 0.75;
		canvas.height = window.innerHeight * 0.5;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		drawBall();
		drawBarre();
	});

	function draw() {

	}

	function gameLoop() {
		update();
		draw();
		requestAnimationFrame(gameLoop);
	}
	gameLoop();
}