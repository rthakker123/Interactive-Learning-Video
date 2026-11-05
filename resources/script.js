const loadBtn = document.getElementById('load-url-button');
const videoContainer = document.getElementById('interactive-video');
const accessCodeDisplay = document.getElementById('access-code');

loadBtn.addEventListener('click', function() {
    const pastedUrl = document.getElementById('url-input').value.trim();

    if (pastedUrl === "") {
        alert("Please paste a URL first!");
        return;
    }

    let videoId = "";

    if (pastedUrl.includes("watch?v=")) {
        videoId = pastedUrl.split("watch?v=")[1].split("&")[0];
    } 
    else if (pastedUrl.includes("youtu.be/")) {
        videoId = pastedUrl.split("youtu.be/")[1].split("?")[0];
    }
    else if (pastedUrl.includes("/embed/")) {
        videoId = pastedUrl.split("/embed/")[1].split("?")[0];
    }

    if (videoId) {
        videoContainer.src = "https://www.youtube.com/embed/" + videoId;
    } 
    else {
        alert("Please enter a valid YouTube URL!");
    }

    fetch('/videos/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoUrl: pastedUrl })
    })
    .then(response => response.json())
    .then(data => {
        accessCodeDisplay.textContent = "Access Code: " + data.accessCode;
    })
    .catch(error => {
        alert("Couldn't connect to server.");
        console.log(error);
    });
    
});
