function ValidConnection() {   
    displayError('');
	document.getElementById('loginButton').addEventListener('click', function() {
		const username_connect = document.getElementById('InputUsername').value;
		const password_connect = document.getElementById('InputPassword').value;

		if (!username_connect || !password_connect) {
            displayError('Veuillez remplir tous les champs !');
            return;
        }

		const formData = {
			username: username_connect,
			password: password_connect,
		};

		fetch('/mypage/', {
			method: 'POST',
			body: JSON.stringify(formData),
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
			}
		})
		.then(response => {
			return response.text().then(text => {
				console.log('Réponse brute du serveur:', text);
				try {
					return JSON.parse(text);
				} catch (e) {
					throw new Error('Erreur de parsing JSON: ' + e.message);
				}
			});
		})
		.then(data => {
			if (data.success) {
				loadMyPage();
			} else if (data.error) {
				displayError(data.error);
			}
		})
		.catch(error => {
			console.error('Erreur lors de la connection :', error);
			displayError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
		});
	});
}

function displayError(message) {
    const errorMessageElement = document.getElementById('error-message');
    if (message) {
        errorMessageElement.innerText = message;
        errorMessageElement.style.display = 'block';
    }
    else {
        errorMessageElement.style.display = 'none';
    }
}