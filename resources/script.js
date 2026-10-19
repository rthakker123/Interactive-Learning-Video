const video = document.getElementById('interactive-video');
const overlay = document.getElementById('interactive-overlay');
const buttons = overlay.querySelectorAll('.btn');

const triggerTime = parseFloat(overlay.dataset.triggerTime);

video.addEventListener('timeupdate', () =>{
    if(Math.floor(video.currentTime) === triggerTime && !video.paused) {
        video.pause();
        overlay.classList.remove('hidden');
    }
})

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const jumpTo = parseFloat(button.dataset.jumpTo);
        overlay.classList.add('hidden');
        video.currentTime = jumpTo;
        video.play();
        
    })
})
