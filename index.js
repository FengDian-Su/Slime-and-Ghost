
const background = document.querySelector('.background');
const role = document.querySelector(".role");
const npc = document.querySelector(".npc");
const npc2 = document.querySelector(".npc2");
const go = document.querySelector(".gameover");
const st = document.getElementById("st");

let positionX = 70;
let positionY = 70;
let positionx = 0;
let isJumping = false;
let intervalId;
let seconds = 0;

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    const formattedTime = formatTime(seconds);
    timerElement.textContent = formattedTime;
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

function startTimer() {
    intervalId = setInterval(() => {
      seconds++;
      updateTimerDisplay();
    }, 1000);
  }

function stopTimer() {
    clearInterval(intervalId);
}

function moveRole() {
    role.style.left = `${positionX}px`;
    role.style.bottom = `${positionY}px`;
}

function handleKeyPress(event) {
    if (event.keyCode === 32) {
        if (!isJumping) {
          isJumping = true;
          jump();
        }
    }
}

function jump() {
    let jumpInterval = setInterval(
        function () {
            positionY += 64;
            moveRole();
            if (positionY >= 135) {
                clearInterval(jumpInterval);
                fall();
            }
        }, 130);
}

function fall() {
    let fallInterval = setInterval(
        function () {
            positionY -= 64;
            moveRole();
            if (positionY <= 70) {
                positionY = 70;
                isJumping = false;
                clearInterval(fallInterval);
            }
        }, 130);
}

function detectCollision() {
    const r1 = role.getBoundingClientRect();
    const r2 = npc.getBoundingClientRect();
    const r22 = npc2.getBoundingClientRect();
    if (r1.right > r2.left+10 && r2.left > 70 && r1.top >= r2.bottom-50 ||
        r1.right > r22.left+10 && r22.left > 70 && r1.top >= r22.bottom-50) {
        console.log("game over");
        gameover();
    }
}

function gameover(){
    background.style.opacity = '0.5';
    role.style.opacity = '0.5';
    npc.style.display = "none";
    npc2.style.display = "none";
    go.style.display = "block";
    stopTimer();
}

function startgame() {
    st.style.display = "none";
    role.style.display = "block";
    npc.style.display = "block";
    npc2.style.display = "block";
    startTimer();
}

document.addEventListener("keydown", handleKeyPress);
setInterval(detectCollision, 100);
st.addEventListener("click", startgame);
