function lobby() {
	const playerName1_public = document.querySelector('.card-lobby-text-name-public-1');
	const colorSelect1_public = document.getElementById('selectColorPlayerPublic1');

	const playerName2_public = document.querySelector('.card-lobby-text-name-public-2');
	const colorSelect2_public = document.getElementById('selectColorPlayerPublic2');

	playerName1_public.classList.add('color-player-none');
	if (playerName2_public)
		playerName2_public.classList.add('color-player-none');

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

	if (colorSelect2_public) {
		colorSelect2_public.addEventListener('change', (event) => {
			playerName2_public.classList.remove(
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
			playerName2_public.classList.add(event.target.value);
		});
	}
	
	document.getElementById('btn-ready').addEventListener('click', function() {
		const player1Color = document.getElementById('selectColorPlayer1').value;
		const player2Color = document.getElementById('selectColorPlayer2').value;
		const maxPoint = document.getElementById('maxPoint').value;
	
		if (player1Color !== 'color-player-none' && player2Color !== 'color-player-none' && player1Color != player2Color && maxPoint > 0) {
			fetch('/store_colors/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken')
				},
				body: JSON.stringify({
					player1Color: player1Color,
					player2Color: player2Color,
					maxPoint: maxPoint
				})
			})
			.then(response => {
				// console.log('Response Status:', response.status);
				return response.text();
			})
			.then(text => {
				// console.log('Response Text:', text);
				try {
					const data = JSON.parse(text);
					loadGame();
				} catch (error) {
					console.error('Parsing error:', error);
				}
			})
			.catch(error => console.error('Fetch error:', error)); // Affiche les erreurs de la requête
		} else {
			alert('Please select differents colors for both players OR a limit point > 0.');
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
