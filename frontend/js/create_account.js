document.getElementById('createAccountBtn').addEventListener('click', function() {
	const emailInput = document.getElementById('floatingInputEmail');
	const username = document.getElementById('floatingInputUsername').value;
	const password = document.getElementById('floatingInputPassword').value;
	const password2 = document.getElementById('floatingInputPassword2').value;

	if (emailInput.value === '' || username === '' || password === '' || password2 === '') {
		alert('Veuillez remplir tous les champs !');
		return;
	}

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour valider l'email
	if (!emailPattern.test(emailInput.value)) {
		emailInput.classList.remove('is-valid');
		emailInput.classList.add('is-invalid');
		alert('Veuillez entrer une adresse email valide !');
		return;
	} else {
		emailInput.classList.remove('is-invalid');
		emailInput.classList.add('is-valid');
	}

	if (password !== password2) {
		alert('Les mots de passe ne correspondent pas !');
		return;
	}
	window.location.href = 'connect.html';
});