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

    const validChangesAccount = document.getElementById('saveChangesAccount');
    if (validChangesAccount) {
        validChangesAccount.addEventListener('click', function() {
            
            const email = document.getElementById('modifEmailAccount').value;
            const username = document.getElementById('modifUsernameAccount').value;
            const password = document.getElementById('modifPasswordAccount').value;
            
            if (!email || !username) {
                displayError('Veuillez remplir tous les champs !');
                return;
            }
            
            const formData = {
                email: email,
                username: username,
                password: password,
            };

            const csrfToken = getCookie('csrftoken'); 
            fetch('/compte/', {
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
    
    document.addEventListener("DOMContentLoaded", function () {
        const profileImage = document.getElementById("profileImage");
        const profileImageInput = document.getElementById("profileImageInput");
        const profileImageButton = document.getElementById("profileImageButton");
    
        const apiUrl = "/avatar/"; // URL de votre API pour gérer les avatars
        const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value; // Récupération du CSRF token
    
        // Fonction pour charger l'avatar actuel
        function loadAvatar() {
            fetch(apiUrl, {
                method: "GET",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/json",
                },
                credentials: "include", // Nécessaire pour envoyer les cookies CSRF/session
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch avatar.");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.avatar_url) {
                        profileImage.src = data.avatar_url; // Affiche l'avatar actuel
                    }
                })
                .catch((error) => console.error("Error loading avatar:", error));
        }
    
        // Fonction pour mettre à jour l'avatar
        function updateAvatar(file) {
            const formData = new FormData();
            formData.append("social.avatar", file);
    
            fetch(apiUrl, {
                method: "PUT",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
                credentials: "include",
                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to update avatar.");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.avatar_url) {
                        profileImage.src = data.avatar_url; // Met à jour l'affichage avec le nouvel avatar
                    }
                })
                .catch((error) => console.error("Error updating avatar:", error));
        }
    
        // Événement : Cliquez pour sélectionner une nouvelle image
        profileImageButton.addEventListener("click", () => {
            profileImageInput.click();
        });
    
        // Événement : Lorsque l'utilisateur sélectionne une nouvelle image
        profileImageInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                // Mise à jour immédiate de l'image dans l'interface utilisateur
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
    
                // Envoi de l'image au backend pour mise à jour
                updateAvatar(file);
            }
        });
    
        // Charger l'avatar au chargement de la page
        loadAvatar();
    });
}


