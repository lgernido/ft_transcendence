function lobby() {
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

	const playerTypeSelect = document.getElementById('playerTypeSelect');
	const colorSelectorContainer = document.getElementById('selectColorPlayer2');

	playerTypeSelect.addEventListener('change', (e) => {
		const selectedType = e.target.value;

		if (selectedType === 'bot') {
			playerName2.textContent = "Bot";
			colorSelectorContainer.style.display = 'block';
		} else {
			playerName2.textContent = "Player2";
			colorSelectorContainer.style.display = 'block';
		}
	});

	document.getElementById('btn-ready-lobby').addEventListener('click', function() {
        const player1Color = document.getElementById('selectColorPlayer1').value;
        const player2Color = document.getElementById('selectColorPlayer2').value;
        const maxPoint = document.getElementById('maxPoint').value;
		if (playerTypeSelect.value == "player")
        	loadGamePrivateCustom(maxPoint, player1Color, player2Color);
		else if (playerTypeSelect.value === "bot")
			loadGameBot(maxPoint, player1Color, player2Color)
    });
}
