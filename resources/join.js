
const joinButton = document.getElementById('join-button');
const accessCodeInput = document.getElementById('access-code');
const message = document.getElementById('message');

joinButton.addEventListener('click', function() {
    const accessCode = accessCodeInput.value.trim().toUpperCase();

    if (accessCode === "") {
        message.textContent = "Please enter an access code.";
        return;
    }

    fetch('/videos/' + encodeURIComponent(accessCode))
        .then(response => {
            if (!response.ok) {
                throw new Error("Invalid access code.");
            }

            return response.json();
        })
        .then(data => {
            window.location.href = "student.html?code=" + encodeURIComponent(accessCode);
        })
        .catch(error => {
            message.textContent = "Invalid access code. Please try again.";
        });
});
