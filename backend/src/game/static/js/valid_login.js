function ValidConnection() {
    displayError('');

    const loginButton = document.getElementById('loginButton')

    loginButton.addEventListener('click', function() {
        const username_connect = document.getElementById('InputUsername').value.trim();
        const password_connect = document.getElementById('InputPassword').value;

        if (!username_connect || !password_connect) {
            displayError(gettext('Fill out all the categories'));
            return;
        }

        const formData = {
            username: username_connect,
            password: password_connect,
        };

        const csrfToken = getCookie('csrftoken');       
        fetch('/log_user/', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Request failed with status ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                loadMyPage();
            } else if (data.error) {
                displayError(data.error);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la connexion :', error);
            displayError(error.message || gettext('An error occurred, please try again'));
        });
    });
}