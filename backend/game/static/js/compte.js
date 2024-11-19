document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('profileImageButton').addEventListener('click', function() {
		document.getElementById('profileImageInput').click();
	});

	// Écoutez l'événement de changement sur l'input pour gérer l'importation de l'image
	document.getElementById('profileImageInput').addEventListener('change', function(event) {
		const file = event.target.files[0];
		
		if (file) {
			const reader = new FileReader();
			
			reader.onload = function(e) {
				// Remplacez l'icône de la personne par l'image importée
				const profileIcon = document.querySelector('.profile-btn i');
				profileIcon.style.backgroundImage = `url(${e.target.result})`;
				profileIcon.style.backgroundSize = 'cover';
				profileIcon.style.color = 'transparent'; // Cacher l'icône par défaut
				profileIcon.style.width = '200px'; // Ajustez la taille si nécessaire
				profileIcon.style.height = '200px'; // Ajustez la taille si nécessaire
				profileIcon.classList.remove('bi-person-circle'); // Retirer l'icône par défaut
			};
			
			reader.readAsDataURL(file);
		}
	});
});