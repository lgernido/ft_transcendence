function ValidFormCreateAccount() {   
    displayError('');
    document.getElementById('submitButton').addEventListener('click', function() {
        const emailInput = document.getElementById('floatingInputEmail');
        const username = document.getElementById('floatingInputUsername').value;
        const password = document.getElementById('floatingInputPassword').value;
        const password2 = document.getElementById('floatingInputPassword2').value;

        if (!emailInput.value || !username || !password || !password2) {
            displayError('Veuillez remplir tous les champs !');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            console.log("Adresse mail invalide");
            displayError('Veuillez entrer une adresse email valide !');
            return;
        }

        const formData = {
            email: emailInput.value,
            username: username,
            password: password,
            password2: password2,
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
                    throw new Error(data.error || 'Erreur inconnue'); 
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
            console.error('Erreur lors de la création du compte :', error);
            displayError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
        });
    });
}
