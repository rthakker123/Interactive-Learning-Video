const video = document.getElementById('interactive-video');
const overlay = document.getElementById('interactive-overlay');
const buttons = overlay.querySelectorAll('.btn');
const questionText = document.getElementById('question-text');

//hardcoded question for testing
const questions = [
    {
        time: 10,
        text: "What is the narrator doing?",
        choices: ["Eating", "Jumping", "Singing", "Dancing"],
        correct: "Jumping",
        shown: false
    },
    {
        time: 45,
        text: "What color is the sky?",
        choices: ["blue", "red", "green", "pink"],
        correct: "blue",
        shown: false
    }
];
        

video.addEventListener('timeupdate', () =>{
    questions.forEach(question => {
    if (video.currentTime >= question.time && !question.shown)
    { question.shown = true;
      video.pause();
     questionText.textContent = question.text;
      overlay.classList.remove('hidden');
    }
});
});


function makeChoice(answer) {
    console.log("Selected:", answer);
    overlay.classList.add('hidden');
    video.play();
}
    
                      
