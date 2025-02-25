function ValidFormCreateAccount() {   
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

    document.getElementById('submitButton').addEventListener('click', function() {
        const emailInput = document.getElementById('floatingInputEmail').value.trim();
        const username = document.getElementById('floatingInputUsername').value.trim();
        const password = document.getElementById('floatingInputPassword').value;
        const password2 = document.getElementById('floatingInputPassword2').value;
        const avatar = document.getElementById('avatar').src;


        if (!emailInput || !username || !password || !password2) {
            displayError(gettext('Fill out all the categories'));
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput)) {
            displayError(gettext('Choose a valid email address'));
            return;
        }

        if (username.length > 12) {
            displayError(gettext('Username too long !'));
            return;
        }

        const formData = {
            email: emailInput,
            username: username,
            password: password,
            password2: password2,
            avatar: avatar,
        };

        const csrfToken = getCookie('csrftoken');

        fetch('/create_account/', {
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
                    throw new Error(gettext(data.error || 'Unknown error')); 
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                loadConnectPage();
            } else if (data.error) {
                displayError(data.error);
            }
        })
        .catch(error => {
            displayError(error.message || gettext('An error occurred, please try again'));
        });
    });
}
