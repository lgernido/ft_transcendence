//verifier le calcule de mouvement

function launchGamePrivate(roomName, maxPoints, DATA) {    
    const canvas = document.getElementById('pong');
    const userId = canvas.dataset.userId;
    const username = canvas.dataset.userUsername;
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
        name: "",
        color:""

    };

    const rightPaddle = {
        x: canvas.width - paddleHeight - 0.01 * canvas.width,
        y: (canvas.height - paddleWidth) / 2,
        score: 0,
        name: "",
        color:""
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
        ctx.fillStyle = leftPaddle.color;
        ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleHeight, paddleWidth);

        ctx.fillStyle = rightPaddle.color;
        ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleHeight, paddleWidth);
    }

    function drawScore() {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const scoreY = canvas.height * 0.1;
        const nameY = canvas.height * 0.05;

        ctx.fillStyle = leftPaddle.color;
        ctx.fillText(leftPaddle.name || "Player 1", (canvas.width / 2) - 50, nameY);
        ctx.fillStyle = 'white';
        ctx.fillText(leftPaddle.score, (canvas.width / 2) - 50, scoreY);

        ctx.fillStyle = rightPaddle.color;
        ctx.fillText(rightPaddle.name || "Player 2", (canvas.width / 2) + 50, nameY);
        ctx.fillStyle = 'white';
        ctx.fillText(rightPaddle.score, (canvas.width / 2) + 50, scoreY);
    }

    function drawGameOver(winnerId, finalScore) {
        let count = 3;
        const elcanvas = document.getElementById("pong")
        // const showScore = document.getElementById("showScore")
        
        const parentDiv = document.getElementById("showArrow");
        const arrow = document.getElementById("arrow")
        if (parentDiv) {
            arrow.style.display = "none";
            arrow.remove();
            parentDiv.style.display = "none";
            parentDiv.remove();
        }

        elcanvas.remove()
        document.getElementById("showScore").classList.remove("d-none");

        const winner = document.getElementById("winner")
        const leftscore =  document.getElementById("leftscore")
        const rightscore =  document.getElementById("rightscore")
        const countdown =  document.getElementById("countdown")

        winner.textContent = winnerId === left_backend ? leftPaddle.name : rightPaddle.name;
        leftscore.textContent = `${finalScore.left}`
        rightscore.textContent = `${finalScore.right}`
        countdown.textContent = count

        createConfetti()
        // Mettre à jour le compte à rebours chaque seconde
        const countdownInterval = setInterval(() => {
            count--;
            countdown.textContent = count
            
            if (count <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
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

    // const wsUrlPong = `${wsScheme}://${window.location.host}/ws/pong/${roomName}/`;
    let his_color;
    let his_hote;
    if (DATA.player1.username == username)
    {
        his_hote = 1;
        his_color = DATA.player1.color.split("-")[2]
    } else {
        his_hote = 0;
        his_color = DATA.player2.color.split("-")[2]
    }
    const wsUrlPong = `wss://${window.location.host}/ws/pong/${roomName}/${his_hote}/${his_color}/${maxPoints}/`;
    wsPong = new WebSocket(wsUrlPong);

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
            leftPaddle.color = data.left_paddle.color;
            rightPaddle.color = data.right_paddle.color;
            leftPaddle.name = data.left_paddle.name;
            rightPaddle.name = data.right_paddle.name;
            requestAnimationFrame(gameLoop);
        }
        else if (data.type === 'game_over') {
            gameActive = false;
            if (wsPong) {
                wsPong.close();
                wsPong = null;
            }
            roomNameGlobal = null;
            drawGameOver(data.winner_id, data.final_score);
            setTimeout(() => {
                loadMyPage();
            }, 3000);
        } else if (data.type === 'game_forfeit') {
            gameActive = false;
            roomNameGlobal = null;
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

            if (wsPong) {
                wsPong.close();
                wsPong = null;
            }
            setTimeout(() => {
                loadMyPage();
            }, 3000);
        }
    };

    wsPong.onopen = function() {};

    wsPong.onclose = function(event) {
        gameActive = false;
        if (!event.wasClean) {
            displayError(gettext("Connection closed unexpectedly. Game ended."));
        }
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
            wsPong = null;
        }
    }

    draw();

    function randomColor() {
        const colors = ['#FF6347', '#FF4500', '#FFD700', '#32CD32', '#1E90FF', '#9932CC'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    function createConfetti() {
        const container = document.querySelector('.confetti-container');
        const numConfetti = 100;  // Le nombre de confettis
    
        for (let i = 0; i < numConfetti; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;  // Position aléatoire horizontale
            confetti.style.animationDuration = `${Math.random() * 2 + 3}s`;  // Durée d'animation aléatoire
            confetti.style.animationDelay = `${Math.random() * 2}s`;  // Délai d'animation aléatoire
            confetti.style.backgroundColor = randomColor();  // Couleur aléatoire
            container.appendChild(confetti);
        }
    }
}
