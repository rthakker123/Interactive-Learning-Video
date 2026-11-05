const loadBtn = document.getElementById('load-url-button');
const videoContainer = document.getElementById('interactive-video');

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
        videoContainer.innerHTML = `
            <iframe
                width="100%"
                height="400"
                src="https://www.youtube.com/embed/${videoId}"
                title="YouTube video player"
                allowfullscreen>
            </iframe>
        `;
    } 
    else {
        alert("Please enter a valid YouTube URL!");
    }
});
