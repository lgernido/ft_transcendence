//verifier le calcule de mouvement

function launchGamePrivate(roomName, maxPoints) {
    roomName = "5x"; // TODO: change to roomName, for now it's hardcoded
    
    const canvas = document.getElementById('pong');
    const userId = canvas.dataset.userId;
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight * 0.5;
    const ctx = canvas.getContext('2d');
    let left_backend = 0;
    let right_backend = 0;
    let gameActive = true;

    // Variables du jeu
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: canvas.width * 0.01
    };

    const paddleWidth = canvas.height * 0.20;
    const paddleHeight = canvas.height * 0.01;
    const leftPaddle = {
        x: 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        score: 0,
        name: ""
    };

    const rightPaddle = {
        x: canvas.width - paddleHeight - 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        score: 0,
        name: ""
    };

    // Gestion des touches
    const keyState = {
        ArrowUp: false,
        ArrowDown: false
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            keyState[e.key] = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            keyState[e.key] = false;
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
        ctx.fillStyle = 'red';
        ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleHeight, paddleWidth);

        ctx.fillStyle = 'blue';
        ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleHeight, paddleWidth);
    }

    function drawScore() {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const scoreY = canvas.height * 0.1;
        const nameY = canvas.height * 0.05;

        ctx.fillStyle = 'red';
        ctx.fillText(leftPaddle.name || "Player 1", (canvas.width / 2) - 50, nameY);
        ctx.fillStyle = 'white';
        ctx.fillText(leftPaddle.score, (canvas.width / 2) - 50, scoreY);

        ctx.fillStyle = 'blue';
        ctx.fillText(rightPaddle.name || "Player 2", (canvas.width / 2) + 50, nameY);
        ctx.fillStyle = 'white';
        ctx.fillText(rightPaddle.score, (canvas.width / 2) + 50, scoreY);
    }

    function drawGameOver(winnerId, finalScore) {
        let countdown = 5; // Initialiser le compte à rebours
        
        function updateGameOverScreen() {
            // Effacer le canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Afficher le gagnant et le score
            ctx.font = '40px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const winnerName = winnerId === left_backend ? leftPaddle.name : rightPaddle.name;
            ctx.fillText(gettext('%(winnerName)s Wins!').replace('%(winnerName)s', winnerName), canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '30px Arial';
            ctx.fillText(gettext('Final Score: %(left)s - %(right)s').replace('%(left)s', finalScore.left).replace('%(right)s', finalScore.right), canvas.width / 2, canvas.height / 2 + 20);
            
            // Afficher le message de redirection avec le décompte
            ctx.font = '20px Arial';
            ctx.fillText(gettext('Game will redirect to lobby in %(countdown)s seconds...').replace('%(countdown)s', countdown), canvas.width / 2, canvas.height / 2 + 80);
        }

        // Mettre à jour le compte à rebours chaque seconde
        const countdownInterval = setInterval(() => {
            countdown--;
            drawField();
            updateGameOverScreen();
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '/mypage';
            }
        }, 1000);

        // Afficher l'écran initial
        updateGameOverScreen();
    }

    function draw() {
        drawField();
        drawBall();
        drawPaddles();
        drawScore();
    }

    function updatePaddlePositions() {
        const isLeftPlayer = userId == left_backend;
        const isRightPlayer = userId == right_backend;
        
        if ((isLeftPlayer || isRightPlayer) && wsPong.readyState === WebSocket.OPEN && gameActive) {
            if (keyState.ArrowUp || keyState.ArrowDown) {
                wsPong.send(JSON.stringify({
                    type: 'move',
                    id: userId,
                    action: keyState.ArrowUp ? 'up' : 'down'
                }));
            }
        }
    }

    // WebSocket setup
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrlPong = `${wsScheme}://${window.location.host}/ws/pong/${roomName}/`;
    const wsPong = new WebSocket(wsUrlPong);

    wsPong.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.type === 'game_update') {
            const { ball: dataBall, left_paddle: dataLeftPaddle, right_paddle: dataRightPaddle } = data;
            
            // Mise à jour des scores et des noms
            leftPaddle.score = dataLeftPaddle.score;
            rightPaddle.score = dataRightPaddle.score;
            leftPaddle.name = dataLeftPaddle.name;
            rightPaddle.name = dataRightPaddle.name;

            // Mise à jour des positions depuis le serveur
            leftPaddle.y = dataLeftPaddle.y * canvas.height;
            rightPaddle.y = dataRightPaddle.y * canvas.height;
            ball.x = dataBall.x * canvas.width;
            ball.y = dataBall.y * canvas.height;
            
        } else if (data.type === 'game_start') {
            left_backend = data.left_paddle.id;
            right_backend = data.right_paddle.id;
            requestAnimationFrame(gameLoop);
        } else if (data.type === 'game_over') {
            gameActive = false;
            drawGameOver(data.winner_id, data.final_score);
            setTimeout(() => {
                window.location.href = '/mypage';
            }, 5000);
        } else if (data.type === 'game_forfeit') {
            gameActive = false;
            // Afficher un message de forfait
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = '40px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillText(`${data.message}`, canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = '30px Arial';
            ctx.fillText(`Final Score: ${data.final_score.left} - ${data.final_score.right}`, 
                canvas.width / 2, canvas.height / 2 + 20);

            // Redirection après un délai
            setTimeout(() => {
                window.location.href = '/mypage';
            }, 3000);
        }
    };

    wsPong.onopen = function() {
        console.log("WebSocket connection opened.");
    };

    wsPong.onclose = function(event) {
        gameActive = false;
        if (!event.wasClean) {
            alert(gettext("Connection closed unexpectedly. Game ended."));
        }
        window.location.href = '/mypage';
    };

    function gameLoop() {
        if (gameActive) {
            updatePaddlePositions();
            draw();
            requestAnimationFrame(gameLoop);
        }
    }

    // Gestion de la fermeture de page
    window.addEventListener('beforeunload', handleGameExit);
    window.addEventListener('unload', handleGameExit);
    window.addEventListener('popstate', handleGameExit);

    // Intercepter les clics sur les liens de navigation
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            handleGameExit();
            setTimeout(() => {
                window.location.href = link.href;
            }, 100);
        }
    });

    function handleGameExit() {
        if (wsPong && wsPong.readyState === WebSocket.OPEN) {
            wsPong.send(JSON.stringify({
                type: 'game_exit',
                id: userId
            }));
            gameActive = false;
            wsPong.close();
        }
    }

    draw();
}
