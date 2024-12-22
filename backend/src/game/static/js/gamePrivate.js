
//verifier le calcule de mouvement

function launchGamePrivate(roomName, maxPoints) {
    const canvas = document.getElementById('pong');
    const userId = canvas.dataset.userId; // Récupération de l'ID de l'utilisateur
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
        id: null, // Identifiant du joueur associé
        speed: 10,
    };

    const rightPaddle = {
        x: canvas.width - paddleHeight - 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        id: null, // Identifiant du joueur associé
        speed: 1,
    };

    let upPressed = false, downPressed = false;
    let paddleMoved = false;

    // WebSocket
    roomName = "4x"
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrlPong = `${wsScheme}://${window.location.host}/ws/pong/${roomName}/`;
    const wsPong = new WebSocket(wsUrlPong);

    wsPong.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log("DATA :", data);

        if (data.type === 'game_update') {
            ball.x = data.ball.x * canvas.width;
            ball.y = data.ball.y * canvas.height;
            if (data.left_paddle.id == userId) {
                leftPaddle.y = data.left_paddle.y * canvas.height;
                rightPaddle.y = data.right_paddle.y * canvas.height;
            } else {
                leftPaddle.y = data.right_paddle.y * canvas.height;
                rightPaddle.y = data.left_paddle.y * canvas.height;
            }
            
        } else if (data.type === 'start') {
            alert(data.message);
        }
    };

    wsPong.onopen = function () {
        console.log("WebSocket connection opened.");
    };

    wsPong.onclose = function () {
        alert("Connection closed. Refresh the page to reconnect.");
    };

    // Événements clavier
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') {
            upPressed = true;
            e.preventDefault();
            paddleMoved = true;
        }
        if (e.key === 'ArrowDown') {
            downPressed = true;
            e.preventDefault();
            paddleMoved = true;
        }
    });

    document.addEventListener('keyup', function (e) {
        if (e.key === 'ArrowUp') {
            upPressed = false;
            e.preventDefault();
        }
        if (e.key === 'ArrowDown') {
            downPressed = false;
            e.preventDefault();
        }
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
        let previousY = rightPaddle.y;
        if (upPressed) rightPaddle.y = Math.max(0, rightPaddle.y - rightPaddle.speed);
        if (downPressed) rightPaddle.y = Math.min(canvas.height - paddleWidth, rightPaddle.y + rightPaddle.speed);

        if (rightPaddle.y !== previousY) {
            paddleMoved = true;
        }

        if (paddleMoved && wsPong.readyState === WebSocket.OPEN) {
            if (upPressed || downPressed) {
                const action = upPressed ? 'up' : 'down';
                wsPong.send(JSON.stringify({
                    type: 'move',
                    id: userId,
                    action: action, // Indiquer l'action
                }));
                console.log("action");
                console.log(action);
            }
            // wsPong.send(JSON.stringify({
            //     type: 'move',
            //     id: userId,
            //     pos: rightPaddle.y / canvas.height, // Normaliser entre 0 et 1
            // }));
            paddleMoved = false;
        }
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
