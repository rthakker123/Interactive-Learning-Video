const loadBtn = document.getElementById("load-url-button");
const urlInput = document.getElementById("url-input");
const video = document.getElementById("interactive-video");
const statusMessage = document.getElementById("status-message");

loadBtn.addEventListener("click", function () {
    const pastedUrl = urlInput.value.trim();
    let videoId = "";

    try {
        const url = new URL(pastedUrl);
        const host = url.hostname.replace("www.", "");

        if (host === "youtube.com" || host === "m.youtube.com") {
            videoId = url.searchParams.get("v") || "";

            if (!videoId && url.pathname.includes("/embed/")) {
                videoId = url.pathname.split("/embed/")[1].split("/")[0];
            }

            if (!videoId && url.pathname.includes("/shorts/")) {
                videoId = url.pathname.split("/shorts/")[1].split("/")[0];
            }
        } else if (host === "youtu.be") {
            videoId = url.pathname.substring(1).split("/")[0];
        }
    } catch (error) {
        statusMessage.textContent = "Please enter a valid YouTube URL.";
        return;
    }

    if (videoId) {
        video.src = "https://www.youtube.com/embed/" + videoId;
        statusMessage.textContent = "Video loaded!";
    } else {
        statusMessage.textContent = "Please enter a valid YouTube URL.";
    }
});