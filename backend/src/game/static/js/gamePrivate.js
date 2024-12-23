
//verifier le calcule de mouvement

function launchGamePrivate(roomName, maxPoints) {
    const canvas = document.getElementById('pong');
    const userId = canvas.dataset.userId; // Récupération de l'ID de l'utilisateur
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight * 0.5;
    const ctx = canvas.getContext('2d');
    let left_backend = 0;
    let right_backend = 0;
    
    // texte
    ctx.font = '30px Arial'; // Taille et famille de police
    ctx.fillStyle = 'white';  // Couleur du texte
    ctx.textAlign = 'center'; // Alignement horizontal
    ctx.textBaseline = 'middle';

    // Variables
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: canvas.width * 0.01,
        speedX: 3,
        speedY: 3,
    };

    const paddleWidth = canvas.height * 0.20; // Hauteur des raquettes
    const paddleHeight = canvas.height * 0.01; // Largeur des raquettes
    const leftPaddle = {
        x: 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        score: 0,
    };

    const rightPaddle = {
        x: canvas.width - paddleHeight - 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        score:0,
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

        if (data.type === 'game_update') {
            ball.y = data.ball.y * canvas.height;
            leftPaddle.score = data.left_paddle.score;
            rightPaddle.score = data.right_paddle.score;
            if (data.left_paddle.id == userId) {
                leftPaddle.y = data.left_paddle.y * canvas.height;
                rightPaddle.y = data.right_paddle.y * canvas.height;
                ball.x = data.ball.x * canvas.width;
            } else {
                leftPaddle.y = data.right_paddle.y * canvas.height;
                rightPaddle.y = data.left_paddle.y * canvas.height;
                ball.x = (1 - data.ball.x)* canvas.width;
            }
        } else if (data.type === 'game_start') {
            left_backend = data.left_paddle.id;
            right_backend = data.right_paddle.id;
            console.log(`start ${userId}: ${left_backend} ${right_backend}`);
            alert(data.message);
            gameLoop();

        } else if (data.type === 'game_state') {
            console.log(data.message);
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
            }
            paddleMoved = false;
        }
    }

    function drawScore(event) {
            // texte
        ctx.font = '30px Arial'; // Taille et famille de police
        ctx.fillStyle = 'white';  // Couleur du texte
        ctx.textAlign = 'center'; // Alignement horizontal
        ctx.textBaseline = 'middle';

        if (left_backend == parseInt(userId))
        {
            ctx.fillText(leftPaddle.score, (canvas.width / 2) + 20, canvas.height * 0.1);
            ctx.fillText(rightPaddle.score, (canvas.width / 2) - 20, canvas.height * 0.1); 
        } else {
            ctx.fillText(leftPaddle.score, (canvas.width / 2) - 20, canvas.height * 0.1);
            ctx.fillText(rightPaddle.score, (canvas.width / 2) + 20, canvas.height * 0.1);
        }
    }

    function draw() {
        drawField();
        drawBall();
        drawPaddles();
        drawScore();
    }

    function gameLoop() {
        updatePaddlePositions();
        draw();
        requestAnimationFrame(gameLoop);
    }

    draw()
}
