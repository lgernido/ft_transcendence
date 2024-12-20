function lobby_private() {
    const playerName1 = document.querySelector('.card-lobby-text-name1');
    const colorSelect1 = document.getElementById('selectColorPlayer1');

    const playerName2 = document.querySelector('.card-lobby-text-name2');
    const colorSelect2 = document.getElementById('selectColorPlayer2');

    playerName1.classList.add('color-player-red');
    playerName2.classList.add('color-player-green');

    const maxPointsInput = document.getElementById('maxPoint');
	maxPointsInput.addEventListener('input', (event) => {
		if (maxPointsInput.value < 1)
			maxPointsInput.value = 1;
		else if (maxPointsInput.value > 40)
			maxPointsInput.value = 40;
	});

    colorSelect1.addEventListener('change', (event) => {
        playerName1.classList.remove(
            'color-player-red',
            'color-player-green',
            'color-player-blue',
            'color-player-yellow',
            'color-player-cyan',
            'color-player-magenta',
            'color-player-orange',
            'color-player-purple',
            'color-player-pink',
            'color-player-gray',
            'color-player-none'
        );
        
        playerName1.classList.add(event.target.value);
    });

    colorSelect2.addEventListener('change', (event) => {
        playerName2.classList.remove(
            'color-player-red',
            'color-player-green',
            'color-player-blue',
            'color-player-yellow',
            'color-player-cyan',
            'color-player-magenta',
            'color-player-orange',
            'color-player-purple',
            'color-player-pink',
            'color-player-gray',
            'color-player-none'
        );
        
        playerName2.classList.add(event.target.value);
    });
    const roomName = document.getElementById("check-invite").textContent;
    if (roomName === "False")
        createRoomP();
    else
        InitWebSocketRoomP(roomName)
}

function createRoomP() {
    fetch("/create_room/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            displayError("Failed to create room");
        }
    })
    .then(data => {
        console.log("Room created successfully:", data.room_name);
        console.log("Join the room using this link:", data.room_link);
        InitWebSocketRoomP(data.room_name);
    })
    .catch(error => {
        loadMyPage();
        displayError("Error creating room:", error);
    });
}

function InitWebSocketRoomP(roomName) {
    socket_roomP = new WebSocket(`wss://${window.location.host}/ws/game/${roomName}/`);

    socket_roomP.onopen = function () {
        console.log("Connected to room:", roomName);
    };

    socket_roomP.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log("Message received:", data.message);
    };

    socket_roomP.onclose = function () {
        console.log("Disconnected from room:", roomName);
    };

    function sendMessage(message) {
        socket_roomP.send(JSON.stringify({ message }));
    }
}