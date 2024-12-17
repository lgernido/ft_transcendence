async function getIsActive() {
    try {
        const response = await fetch('/GetUser42/');

        if (!response.ok) {
            console.error(`Erreur HTTP : ${response.status}`);
            return false;
        }

        const data = await response.json();

        if (data.error) {
            console.error('Erreur dans la réponse :', data.error);
            return false;
        }

        return data.is_42;
    } catch (error) {
        console.error('Erreur lors de la requête :', error);
        return false;
    }
}

async function validChanges() {
    displayError('');
    const user42 = await getIsActive();
    console.log("User42: ", user42);
    if (document.getElementById('profileImageButton') && !user42) {
        document.getElementById('profileImageButton').addEventListener('click', function() {
            document.getElementById('profileImageInput').click();
        });
    }

    document.getElementById('profileImageInput').addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const profileIcon = document.querySelector('.profile-btn img');
                profileIcon.src = e.target.result;
                profileIcon.style.width = '200px';
                profileIcon.style.height = '200px';
            };

            reader.readAsDataURL(file);
        }
    });

    if (user42) {
        document.getElementById("modifEmailAccount").disabled = true;
        document.getElementById("modifUsernameAccount").disabled = true;
        document.getElementById("modifPasswordAccount").disabled = true;
    }

    const validChangesAccount = document.getElementById('saveChangesAccount');
    if (validChangesAccount) {
        validChangesAccount.addEventListener('click', function() {
            const email = document.getElementById('modifEmailAccount').value;
            const username = document.getElementById('modifUsernameAccount').value;
            const password = document.getElementById('modifPasswordAccount').value;
            const avatar = document.querySelector('.profile-btn img').src;

            if (!email || !username) {
                displayError('Veuillez remplir tous les champs !');
                return;
            }

            const formData = {
                email: email,
                username: username,
                password: password || null,
                avatar: avatar,
            };

            const csrfToken = getCookie('csrftoken');

            fetch('/compte/', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken,
                },
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
                    console.error('Erreur lors de la modification du compte :', error);
                    displayError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
                });
        });
    }
}
