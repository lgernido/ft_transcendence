// /* permet d'adapter la couleur du texte en fonction de ce qui est ecris */
// document.addEventListener('DOMContentLoaded', function() {
// 	const results = document.querySelectorAll('.result');

// 	results.forEach(result => {
// 		const text = result.textContent.trim();
// 		if (text === "Win") {
// 			result.classList.add('win-color');
// 		}
// 		else if (text === "Lose") {
// 			result.classList.add('lose-color');
// 		}
// 		else if (text === "Draw") {
// 			result.classList.add('draw-color');
// 		}
// 	});
// });

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

    loadheader();
});

function loadscript(file, func) {
    const script = document.createElement('script');
    script.src = "/static/js/" + file;
    document.body.appendChild(script);
    script.onload = () => {
        func();
    }
}

function loadConnectPage() {
    const appDiv = document.getElementById('app');
    fetch('/connect/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;
            loadscript('valid_login.js', () => ValidConnection());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadCreateAccount() {
    const appDiv = document.getElementById('app');
    fetch('/create_account/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('create_account.js', () => ValidFormCreateAccount());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadMyPage() {
    const appDiv = document.getElementById('app');
    fetch('/mypage/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadStats() {
    const appDiv = document.getElementById('app');
    fetch('/stats/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('camenbert.js', () => drawCamembert());
            loadscript('loadelement.js', () => loadchat());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadFriends() {
    const appDiv = document.getElementById('app');
    fetch('/amis/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadAccount()
{
    const appDiv = document.getElementById('app');
    fetch('/compte/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('compte.js', () => validChanges());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadTournament()
{
    const appDiv = document.getElementById('app');
    fetch('/lobby_tournament/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('lobby_tournament.js', () => tournament());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPublic() {
    const appDiv = document.getElementById('app');
    fetch('/lobby/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('lobby.js', () => lobby());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadPrivate() {
    const appDiv = document.getElementById('app');
    fetch('/lobby_private/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('lobby_private.js', () => lobby_private());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadGame() {
    const appDiv = document.getElementById('app');
    fetch('/game/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;

            loadscript('loadelement.js', () => loadchat());
            loadscript('game.js', () => lauchgame());
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

document.addEventListener('DOMContentLoaded', loadConnectPage);

