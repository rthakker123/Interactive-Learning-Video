const video = document.getElementById('interactive-video');
const message = document.getElementById('message');

// Get the access code from the page URL
const urlParams = new URLSearchParams(window.location.search);
const accessCode = urlParams.get('code');

// Check if an access code was provided
if (!accessCode) {
    message.textContent = "No access code was provided.";
} 
else {
    // Ask the server for the video connected to this code
    fetch('/videos/' + encodeURIComponent(accessCode))
        .then(response => {
            if (!response.ok) {
                throw new Error("Lesson not found.");
            }

            return response.json();
        })
        .then(data => {
            const videoUrl = data.videoUrl;

            let videoId = "";

            if (videoUrl.includes("watch?v=")) {
                videoId = videoUrl.split("watch?v=")[1].split("&")[0];
            } 
            else if (videoUrl.includes("youtu.be/")) {
                videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
            }
            else if (videoUrl.includes("/embed/")) {
                videoId = videoUrl.split("/embed/")[1].split("?")[0];
            }

            if (videoId) {
                video.src = "https://www.youtube.com/embed/" + videoId;
                message.textContent = "";
            } 
            else {
                message.textContent = "The video URL is not valid.";
            }
        })
        .catch(error => {
            message.textContent = "Could not find this lesson. Check your access code.";
        });
}
