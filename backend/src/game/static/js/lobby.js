function lobby() {
    const playerName1 = document.querySelector('.card-lobby-text-name1');
    const colorSelect1 = document.getElementById('selectColorPlayer1');

    const playerName2 = document.querySelector('.card-lobby-text-name2');
    const colorSelect2 = document.getElementById('selectColorPlayer2');

    playerName1.classList.add('color-player-red');
    playerName2.classList.add('color-player-green');

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

	function generateRandomString(length = 8) {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}
	

	document.getElementById('btn-ready').addEventListener('click', function() {
        const player1Color = document.getElementById('selectColorPlayer1').value;
        const player2Color = document.getElementById('selectColorPlayer2').value;
        const maxPoint = document.getElementById('maxPoint').value;
        // const userInfoDiv = document.getElementById('user-info');
        // const username = userInfoDiv.getAttribute('data-username');
	
		const generateUUID = generateRandomString(8);
		const roomName = `${generateUUID}_room`;

		console.log('Room name:', roomName);

        if (player1Color !== 'color-player-none' && player2Color !== 'color-player-none' && player1Color != player2Color && maxPoint > 0 && maxPoint < 40) {
            fetch("create_room/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({
                    roomName: roomName,
                    player1Color: player1Color,
                    player2Color: player2Color,
                    maxPoint: maxPoint,
                }),
            })
                .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
                .then(({ status, body }) => {
                    if (status === 200) {
                        loadGame(roomName, maxPoint);
                    } else {
                        alert(body.error || 'Failed to create room');
                    }
                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                    alert('Failed to create room');
            });
        } else {
            alert('Please select differents colors for both players OR a limit point betwenn 0 and 40.');
        }
    });
	    
    // Fonction pour récupérer le token CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

/*let socket;

function lobby() {
	const playerName1_public = document.querySelector('.card-lobby-text-name-public-1');
	const colorSelect1_public = document.getElementById('selectColorPlayerPublic1');
	const maxPointsInput = document.getElementById('maxPoint');

	playerName1_public.classList.add('color-player-red');

	socket = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/lobby/`
    );

	socket.onopen = function() {
		console.log("WebSocket connected to the lobby");
		socket.send(JSON.stringify({
			action: 'player_join',
			player: playerName1_public.innerText
		}));
	}

	socket.onmessage = function(event) {
		const data = JSON.parse(event.data);

		if (data.status === 'start_game') {
			const player1Color = document.getElementById('selectColorPlayerPublic1').value;
			const player2Color = 'color-player-green';
			const maxPoint = document.getElementById('maxPoint').value;
        	const roomName = data.room_name;

			console.log('Game starting on room:', roomName);

			fetch("create_dynamic_room/", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken'),
				},
				body: JSON.stringify({
					roomName: roomName,
					player1Color: player1Color,
					player2Color: player2Color,
					maxPoint: maxPoint,
				}),
			})
				.then((response) => response.json().then((data) => ({ status: response.status, body: data })))
				.then(({ status, body }) => {
					if (status === 200) {
						console.log('Game created, GO!');
						loadGame(roomName, maxPoint);
					} else {
						alert(body.error || 'Failed to create room');
					}
				})
				.catch((error) => {
					console.error('Fetch error:', error);
					alert('Failed to create room');
			});
		}
	};

	socket.onerror = function(error) {
		console.error('WebSocket error:', error);
	}

	socket.onclose = function(event) {
		console.log('WebSocket closed:', event);
	}

	maxPointsInput.addEventListener('input', (event) => {
		if (maxPointsInput.value < 1)
			maxPointsInput.value = 1;
		else if (maxPointsInput.value > 40)
			maxPointsInput.value = 40;
	});

	colorSelect1_public.addEventListener('change', (event) => {
		playerName1_public.classList.remove(
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
		playerName1_public.classList.add(event.target.value);
	});

	// Fonction pour récupérer le token CSRF
	function getCookie(name) {
		let cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = cookies[i].trim();
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
}
*/