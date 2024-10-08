/* permet d'inserer le header dans toutes les pages et de mettre en place le system de selection active */
document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
	.then(response => {
		if (!response.ok) {
			throw new Error('Error network response');
		}
		return response.text();
	})
	.then(data => {
		document.getElementById('header-placeholder').innerHTML = data;
            const navLinks = document.querySelectorAll('.btn-header');

            const currentPath = window.location.pathname;
            let newPath = currentPath.replace("/frontend/", "");
            // console.log(navLinks);
            
            navLinks.forEach(link => {
                if (link.getAttribute('href') === newPath) {
                    link.classList.add('active');
                }
            });
	})
	.catch(error => {
		console.error('There has been a problem with your fetch operation:', error);
	});
});

/* permet d'adapter la couleur du texte en fonction de ce qui est ecris */
document.addEventListener('DOMContentLoaded', function() {
    const results = document.querySelectorAll('.result');

    results.forEach(result => {
        const text = result.textContent.trim();
        if (text === "Win") {
            result.classList.add('win-color');
        }
        else if (text === "Lose") {
            result.classList.add('lose-color');
        }
        else if (text === "Draw") {
            result.classList.add('draw-color');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const themeLinks = document.querySelectorAll('.dropdown-item-color');

    themeLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            // Retirer les classes de thème existantes
            document.body.classList.remove('theme-default', 'theme-light', 'theme-dark');
            
            // Ajouter la nouvelle classe de thème sélectionnée
            const selectedTheme = this.getAttribute('data-theme');
            document.body.classList.add(`theme-${selectedTheme}`);
        });
    });
});