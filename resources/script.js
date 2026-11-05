const loadBtn = document.getElementById('load-url-button');
const videoIframe = document.getElementById('interactive-video');

loadBtn.addEventListener('click', () => {
    const pastedUrl = document.getElementById('url-input').value.trim();

    if (!pastedUrl) {
        alert("Please paste a URL first!");
        return;
    }

    let videoId = "";

    // Handle standard watch URLs (e.g., https://www.youtube.com/watch?v=...)
    if (pastedUrl.includes("watch?v=")) {
        videoId = pastedUrl.split("watch?v=")[1]?.split("&")[0];
    } 
    // Handle short URLs (e.g., https://youtu.be/...)
    else if (pastedUrl.includes("youtu.be/")) {
        videoId = pastedUrl.split("youtu.be/")[1]?.split("?")[0];
    }
    // Handle embed URLs
    else if (pastedUrl.includes("/embed/")) {
        videoId = pastedUrl.split("/embed/")[1]?.split("?")[0];
    }

    if (videoId) {
        videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
        console.log("Successfully loaded YouTube ID:", videoId);
    } else {
        alert("Please enter a valid YouTube URL!");
    }
});
