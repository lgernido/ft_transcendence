const savedValue = localStorage.getItem('selectedValue');
const dropdownButton = document.getElementById('dropdownButton');
const cardContainer = document.getElementById('cardContainer');

if (savedValue) {
	dropdownButton.textContent = `NB playeur: ${savedValue}`;
	generateCards(savedValue);
}

document.querySelectorAll('.dropdown-item').forEach(item => {
	item.addEventListener('click', (event) => {
		event.preventDefault();
		const selectedValue = event.target.getAttribute('data-nb-player');
		localStorage.setItem('selectedValue', selectedValue);
		window.location.reload();
	});
});

function generateCards(count) {
	cardContainer.innerHTML = '';
	for (let i = 0; i < count; i++) {
		const card = document.createElement('div');
		card.classList.add('card-lobby-wait', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'm-4');
		
		card.innerHTML = `
			<div class="d-flex flex-column align-items-center">
				<div class="spinner-border mt-3" role="status" style="color: #dedede;">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>
			<div class="card-lobby-body d-flex align-items-center justify-content-center">
				<p class="card-lobby-text" style="color: #dedede;">Waiting for player...</p>
			</div>
		`;
		cardContainer.appendChild(card);
	}
}