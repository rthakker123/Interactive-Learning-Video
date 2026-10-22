let customQuizPoint = {
  time: 5,
  question: "Select an option to continue:",
  choices: [
    { text: "Option A", jumpTo: 10 },
    { text: "Option B", jumpTo: 20 }
  ]
};

let hasTriggered = false;

// 1. Save user input into our quiz object when they click save
saveBtn.addEventListener('click', () => {
  customQuizPoint.time = parseFloat(inputTime.value) || 0;
  customQuizPoint.question = inputQuestion.value || "Make a choice:";
  
  customQuizPoint.choices = [
    { text: choiceAText.value || "Option A", jumpTo: parseFloat(choiceAJump.value) || 0 },
    { text: choiceBText.value || "Option B", jumpTo: parseFloat(choiceBJump.value) || 0 }
  ];

  alert("Custom question saved! Play the video to test it.");
  video.currentTime = 0; // Rewind to start
  hasTriggered = false;
});

// 2. Watch video time and pause at the user-defined timestamp
video.addEventListener('timeupdate', () => {
  const currentTime = Math.floor(video.currentTime);

  if (currentTime === customQuizPoint.time && !hasTriggered && !video.paused) {
    hasTriggered = true;
    showCustomOverlay(customQuizPoint);
  }
});

// 3. Dynamically build the overlay buttons using the user's custom choices
function showCustomOverlay(quizData) {
  video.pause();
  questionTextElement.innerText = quizData.question;
  choiceButtonsContainer.innerHTML = ''; // Clear old buttons

  quizData.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.innerText = `${choice.text} (Jump to ${choice.jumpTo}s)`;
    
    btn.onclick = () => {
      overlay.classList.add('hidden');
      video.currentTime = choice.jumpTo;
      video.play();
    };

    choiceButtonsContainer.appendChild(btn);
  });

  overlay.classList.remove('hidden');
}

// Reset trigger if user scrubs/seeks through the video
video.addEventListener('seeking', () => {
  hasTriggered = false;
});
