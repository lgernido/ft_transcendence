// function launchGamePrivate(roomName, maxPoints) {
	
// 	// Inititialision du canva
// 	var canvas = document.getElementById('pong');
// 	canvas.width = window.innerWidth * 0.75;
// 	canvas.height = window.innerHeight  * 0.5;

// 	// Appliquer du style
// 	const ctx = canvas.getContext('2d');
// 	ctx.fillStyle = "black";
// 	ctx.fillRect(0, 0, canvas.width, canvas.height);

	
// 	// Ball
// 	function drawBall() {
// 		var ballRadius = 10;
// 		var ballX = canvas.width / 2;
// 		var ballY = canvas.height / 2;
// 		var ballSpeedX = 2;
// 		var ballSpeedY = 2;
// 		ctx.beginPath();
// 		ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false);
// 		ctx.fillStyle = 'red';
// 		ctx.fill();
// 		ctx.closePath();
// 	}

	
// 	// Barre
// 	function drawBarre() {
//     // Dimensions communes aux deux barres
//     var barWidth = canvas.height * 0.20; // Hauteur de la barre
//     var barHeight = canvas.height * 0.01; // Largeur de la barre
//     var barY = (canvas.height - barWidth) / 2; // Centrée verticalement

//     // Player droite (barre à droite)
//     var barXRight = canvas.width - barHeight - (0.01 * canvas.width); // Position à droite
//     ctx.fillStyle = 'blue';
//     ctx.fillRect(barXRight, barY, barHeight, barWidth);

//     // Player gauche (barre à gauche)
//     var barXLeft = 0.01 * canvas.width; // Position à gauche
//     ctx.fillStyle = 'red'; // Une couleur différente pour la barre gauche
//     ctx.fillRect(barXLeft, barY, barHeight, barWidth);
// }
	
// 	drawBall();
// 	drawBarre();
	
// 	// Modification des variables en fontion de la taille de l'ecran
// 	window.addEventListener('resize', function() {
// 		canvas.width = window.innerWidth * 0.75;
// 		canvas.height = window.innerHeight * 0.5;
// 		ctx.fillStyle = "black";
// 		ctx.fillRect(0, 0, canvas.width, canvas.height);
// 		drawBall();
// 		drawBarre();
// 	});

// 	function draw() {

// 	}

// 	function gameLoop() {
// 		update();
// 		draw();
// 		requestAnimationFrame(gameLoop);
// 	}
// 	gameLoop();
// }


function launchGamePrivate(roomName, maxPoints) {
    const canvas = document.getElementById('pong');
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight * 0.5;
    const ctx = canvas.getContext('2d');

    // Variables
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speedX: 3,
        speedY: 3,
    };

    const paddleWidth = canvas.height * 0.20; // Hauteur des raquettes
    const paddleHeight = canvas.height * 0.01; // Largeur des raquettes
    const leftPaddle = {
        x: 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        speed: 5,
    };

    const rightPaddle = {
        x: canvas.width - paddleHeight - 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        speed: 5,
    };

    let upPressed = false, downPressed = false;

    // WebSocket
	const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
	roomName = "4x"; // a effacer
	const wsUrl = `${wsScheme}://${window.location.host}/ws/pong/${roomName}/`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.type === 'game_update') {
            ball.x = data.ball.x;
            ball.y = data.ball.y;
            leftPaddle.y = data.leftPaddle.y;
            rightPaddle.y = data.rightPaddle.y;
        } else if (data.type === 'start') {
		gameStarted = true;
		alert(data.message);
	}
    };

    ws.onclose = function () {
        alert("Connection closed. Refresh the page to reconnect.");
    };

    // Événements clavier
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') upPressed = false;
        if (e.key === 'ArrowDown') downPressed = true;
    });

    document.addEventListener('keyup', function (e) {
        if (e.key === 'ArrowUp') upPressed = true;
        if (e.key === 'ArrowDown') downPressed = false;
    });

    function drawField() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddles() {
        ctx.fillStyle = 'red'; // Gauche
        ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleHeight, paddleWidth);

        ctx.fillStyle = 'blue'; // Droite
        ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleHeight, paddleWidth);
    }

    function updatePaddlePositions() {
        if (upPressed) rightPaddle.y = Math.max(0, rightPaddle.y - rightPaddle.speed);
        if (downPressed) rightPaddle.y = Math.min(canvas.height - paddleWidth, rightPaddle.y + rightPaddle.speed);

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'move',
                paddle: 'right',
              y: rightPaddle.y,
          }));
          };
    }

    function draw() {
        drawField();
        drawBall();
        drawPaddles();
    }

    function gameLoop() {
        updatePaddlePositions();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}
