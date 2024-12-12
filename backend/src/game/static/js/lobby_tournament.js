function tournament(){
	const maxPointsInput = document.getElementById('inputMaxPoint');
    const cardContainer = document.getElementById('cardContainerTournament');

	document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedValue = event.target.getAttribute('data-nb-player');
            localStorage.setItem('selectedValue', selectedValue);
            generateCards(selectedValue);
        });
    });

	const savedValue = localStorage.getItem('selectedValue');
    if (savedValue) {
        generateCards(savedValue);
    }

	maxPointsInput.addEventListener('input', (event) => {
		if (maxPointsInput.value < 1)
			maxPointsInput.value = 1;
		else if (maxPointsInput.value > 40)
			maxPointsInput.value = 40;
	});

	function generateCards(count) {
        cardContainer.innerHTML = ''; 

        for (let i = 0; i < count; i++) {
            const card = document.createElement('div');
            card.classList.add('card-lobby-wait-tournament', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'm-4');

            card.innerHTML = `
                <div class="d-flex flex-column align-items-center">
                    <p class="player-number">Joueur ${i + 1}</p>
                </div>
                <div class="card-lobby-body d-flex align-items-center justify-content-center">
                    <input type="text" class="form-control mt-3" placeholder="Enter pseudo" id="player-${i}">
                </div>
            `;
            cardContainer.appendChild(card);
        }
    }
}

function updateTournamentContent(selectedValue) {
    const cardContainer = document.getElementById('cardContainerTournament');

    cardContainer.innerHTML = '';

    fetch('/lobby_tournament/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de réseau : ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(player => {
                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                playerCard.innerHTML = `<p>${player.name}</p>`;
                cardContainer.appendChild(playerCard);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données :', error);
            cardContainer.innerHTML = `<p>Une erreur est survenue : ${error.message}</p>`;
        });
}
