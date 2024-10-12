document.addEventListener('DOMContentLoaded', () => {
	const playerName1 = document.querySelector('.card-lobby-text-name1');
	const colorSelect1 = document.getElementById('selectColorPlayer1');

	const playerName2 = document.querySelector('.card-lobby-text-name2');
	const colorSelect2 = document.getElementById('selectColorPlayer2');

	playerName1.classList.add('color-player-none');
	playerName2.classList.add('color-player-none');

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
});