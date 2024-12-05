const socket = new WebSocket(`ws://${window.location.host}/ws/game/${roomName}/`);

socket.onmessage = function (e) {
    const data = JSON.parse(e.data);

    if (data.type === "game_state") {
        document.querySelector(".left-barre").style.top = `${data.left_bar_pos}%`;
        document.querySelector(".right-barre").style.top = `${data.right_bar_pos}%`;
        document.querySelector(".ball").style.left = `${data.ball_pos.x}%`;
        document.querySelector(".ball").style.top = `${data.ball_pos.y}%`;
        document.querySelector("#scorePLeft").innerText = data.left_score;
        document.querySelector("#scorePRight").innerText = data.right_score;
    } else if (data.type === "game_over") {
        const winnerMessage = `Winner: ${data.winner === "left" ? "Player 1" : "Player 2"}`;
        document.querySelector("#winnerMessage").innerText = winnerMessage;
    }
};

socket.onclose = function () {
    console.error("WebSocket closed unexpectedly");
};

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
        socket.send(JSON.stringify({ type: "move", player: "right", direction: -5 }));
    } else if (event.key === "ArrowDown") {
        socket.send(JSON.stringify({ type: "move", player: "right", direction: 5 }));
    } else if (event.key === "w") {
        socket.send(JSON.stringify({ type: "move", player: "left", direction: -5 }));
    } else if (event.key === "s") {
        socket.send(JSON.stringify({ type: "move", player: "left", direction: 5 }));
    }
});