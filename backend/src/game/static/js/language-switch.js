let currentLanguage = localStorage.getItem('language') || 'en';

function selectLanguage() {
    document.querySelector('.language-switcher form').addEventListener('submit', function(event) {
        window.location.reload();
    });
}

