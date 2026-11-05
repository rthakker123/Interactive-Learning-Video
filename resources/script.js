const loadBtn = document.getElementById("load-url-button");
const urlInput = document.getElementById("url-input");
const accessCodeInput = document.getElementById("access-code-input");
const loadQuizBtn = document.getElementById("load-quiz-button");
const overlay = document.getElementById("interactive-overlay");
const questionText = document.getElementById("question-text");
const answerOptions = document.getElementById("answer-options");
const answerFeedback = document.getElementById("answer-feedback");
const continueBtn = document.getElementById("continue-button");
const statusMessage = document.getElementById("status-message");
const questionForm = document.getElementById("question-form");
const teacherStatus = document.getElementById("teacher-status");

let player = null;
let playerReady = false;
let questions = [];
let askedQuestionIds = new Set();
let activeQuestion = null;
let quizLoaded = false;
let checkTimer = null;

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
}

function parseYouTubeId(rawUrl) {
    try {
        const url = new URL(rawUrl);
        const host = url.hostname.replace(/^www\./, "").toLowerCase();
        if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
        if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
            if (url.pathname === "/watch") return url.searchParams.get("v");
            const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
            return match ? match[1] : null;
        }
    } catch {
        return null;
    }
    return null;
}

function loadVideo() {
    const videoId = parseYouTubeId(urlInput.value.trim());
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
        setStatus("Please enter a valid YouTube video URL.", true);
        return;
    }
    if (!playerReady) {
        setStatus("The video player is still loading. Try again in a moment.");
        return;
    }
    player.loadVideoById(videoId);
    askedQuestionIds.clear();
    activeQuestion = null;
    overlay.classList.add("hidden");
    setStatus("Video loaded. Load the quiz access code to enable questions.");
}

function loadQuiz() {
    const code = accessCodeInput.value.trim();
    if (!code) {
        setStatus("Enter a quiz access code first.", true);
        return;
    }
    fetch(`/questions/getQuiz/${encodeURIComponent(code)}`)
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Could not load quiz.");
            return data;
        })
        .then(data => {
            questions = data.map(q => ({...q, timestampSeconds: parseTimestamp(q.timestamp)}))
                .filter(q => Number.isFinite(q.timestampSeconds))
                .sort((a, b) => a.timestampSeconds - b.timestampSeconds);
            askedQuestionIds.clear();
            quizLoaded = true;
            setStatus(questions.length ? `Loaded ${questions.length} question(s).` : "No questions found for that code.");
        })
        .catch(error => setStatus(error.message, true));
}

function parseTimestamp(value) {
    const text = String(value ?? "").trim();
    if (/^\d+(\.\d+)?$/.test(text)) return Number(text);
    const parts = text.split(":");
    if (parts.length === 2 && parts.every(part => /^\d+(\.\d+)?$/.test(part))) {
        return Number(parts[0]) * 60 + Number(parts[1]);
    }
    if (parts.length === 3 && parts.every(part => /^\d+(\.\d+)?$/.test(part))) {
        return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
    }
    return NaN;
}

function checkForQuestions() {
    if (!playerReady || !quizLoaded || activeQuestion || !player || typeof player.getCurrentTime !== "function") return;
    const currentTime = player.getCurrentTime();
    const nextQuestion = questions.find(q =>
        !askedQuestionIds.has(q.id) && currentTime >= q.timestampSeconds
    );
    if (nextQuestion) showQuestion(nextQuestion);
}

function showQuestion(question) {
    activeQuestion = question;
    askedQuestionIds.add(question.id);
    player.pauseVideo();
    questionText.textContent = question.question;
    answerOptions.replaceChildren();
    answerFeedback.textContent = "";
    continueBtn.classList.add("hidden");

    ["a", "b", "c", "d"].forEach(letter => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";
        button.textContent = `${letter.toUpperCase()}. ${question[letter]}`;
        button.addEventListener("click", () => submitAnswer(letter));
        answerOptions.appendChild(button);
    });
    overlay.classList.remove("hidden");
}

function submitAnswer(choice) {
    if (!activeQuestion) return;
    const buttons = answerOptions.querySelectorAll("button");
    buttons.forEach(button => button.disabled = true);
    const correct = choice === activeQuestion.correctAnswer;
    answerFeedback.textContent = correct ? "Correct! You can continue." : "Not quite. Review the choices, then continue.";
    answerFeedback.classList.toggle("correct", correct);
    answerFeedback.classList.toggle("incorrect", !correct);
    continueBtn.classList.remove("hidden");
}

continueBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    activeQuestion = null;
    if (playerReady) player.playVideo();
});

loadBtn.addEventListener("click", loadVideo);
loadQuizBtn.addEventListener("click", loadQuiz);

questionForm.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(questionForm);
    const payload = Object.fromEntries(formData.entries());
    payload.accessCode = payload.accessCode.trim();
    payload.timestamp = payload.timestamp.trim();
    payload.question = payload.question.trim();

    if (!Number.isFinite(parseTimestamp(payload.timestamp))) {
        teacherStatus.textContent = "Enter timestamp as seconds or mm:ss.";
        teacherStatus.classList.add("error");
        return;
    }

    try {
        const response = await fetch("/questions/add", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not save question.");
        teacherStatus.textContent = "Question saved. Students can load it using this access code.";
        teacherStatus.classList.remove("error");
        questionForm.reset();
    } catch (error) {
        teacherStatus.textContent = error.message;
        teacherStatus.classList.add("error");
    }
});

// YouTube IFrame API must be loaded before the player can be created.
window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("interactive-video", {
        width: "100%",
        height: "100%",
        videoId: "I2wURDqiXdM",
        playerVars: {playsinline: 1, rel: 0},
        events: {
            onReady: () => {
                playerReady = true;
                setStatus("Player ready. Load a video and quiz access code.");
                checkTimer = window.setInterval(checkForQuestions, 400);
            },
            onError: event => setStatus(`YouTube player error (${event.data}). Check the video URL or embedding permissions.`, true)
        }
    });
};

const youtubeApi = document.createElement("script");
youtubeApi.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(youtubeApi);

window.addEventListener("beforeunload", () => {
    if (checkTimer) window.clearInterval(checkTimer);
});