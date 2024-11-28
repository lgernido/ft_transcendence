function validChanges() {
	displayError('');

    if (document.getElementById('profileImageButton'))
    {
        document.getElementById('profileImageButton').addEventListener('click', function() {
            document.getElementById('profileImageInput').click();
        });
    }

    document.getElementById('profileImageInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Remplacez l'icône de la personne par l'image importée
                const profileIcon = document.querySelector('.profile-btn img');
                
                // Mettez à jour la source de l'image avec la nouvelle image
                profileIcon.src = e.target.result;
                
                // Vous pouvez aussi ajuster le style de l'image si nécessaire
                profileIcon.style.width = '200px'; // Ajustez la taille si nécessaire
                profileIcon.style.height = '200px'; // Ajustez la taille si nécessaire
            };
            
            // Lire l'image comme une URL de données
            reader.readAsDataURL(file);
        }
    });
    

    const validChangesAccount = document.getElementById('saveChangesAccount');
    if (validChangesAccount) {
        validChangesAccount.addEventListener('click', function() {
            
            const email = document.getElementById('modifEmailAccount').value;
            const username = document.getElementById('modifUsernameAccount').value;
            const password = document.getElementById('modifPasswordAccount').value;
            const avatar = document.getElementById('avatar').src;

            if (!email || !username) {
                displayError('Veuillez remplir tous les champs !');
                return;
            }
            
            const formData = {
                email: email,
                username: username,
                password: password,
                avatar: avatar
            };
            
            console.log(email, username, password)

            const csrfToken = getCookie('csrftoken'); 
            fetch('compte/', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken,
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => { 
                        throw new Error(data.error || 'Erreur inconnue'); 
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    loadAccount();
                } else if (data.error) {
                    displayError(data.error);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la création du compte :', error);
                displayError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
            });
        });
    }
}
