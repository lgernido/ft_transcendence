document.addEventListener('DOMContentLoaded', () => {
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
});