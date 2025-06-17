const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const bgOverlay = document.getElementById('bg-overlay');
let obstacleInterval;
let activeObstacles = [];
const obstacleSpeed = 10;

function showScreen(screenToShow) {
  [startScreen, gameScreen, gameOverScreen].forEach(screen => {
    screen.classList.add('hidden');
  });
  screenToShow.classList.remove('hidden');
  bgOverlay.style.opacity = 0;
}

function showStartScreen() {
  showScreen(startScreen);
  bgOverlay.style.opacity = 1; // 背景變淡
}

startBtn.addEventListener('click', () => {
  showScreen(gameScreen); // 切換到遊戲畫面
  startGame();            // 啟動遊戲邏輯
});

restartBtn.addEventListener('click', () => {
  showScreen(gameScreen);  // 直接切換到遊戲畫面
  bgOverlay.style.opacity = 0; // 背景正常
  startGame();             // 直接啟動遊戲
});

function startGame() {
  elapsedSeconds = 0;   // 重置秒數
  console.log("遊戲開始！");
  bgOverlay.style.opacity = 0;
  document.getElementById('bg-container').classList.remove('dimmed');
  if (!bgAnimating) {
    bgAnimating = true;
    animateBackground();
  }
  startObstacleSpawner();
  startTimer();  // 開始計時器
}

let isJumping = false;
let jumpTimeout = null;
let jumpCount = 0;
const maxJumps = 2;
let canJump = true;

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();

    if (jumpCount >= maxJumps) return;

    jumpCount++;
    canJump = false;

    // 清除舊的延遲（避免連續觸發）
    if (jumpTimeout) clearTimeout(jumpTimeout);

    jumpTimeout = setTimeout(() => {
      const player = document.getElementById('player');

      if (jumpCount === 1) {
        player.classList.add('jump1');

        player.addEventListener('animationend', function handler() {
          player.classList.remove('jump1');

          // 如果在一段跳後沒執行二段跳
          if (jumpCount === 1) {
            jumpCount = 0;
            canJump = true;
          }

          player.style.bottom = '21vh';
          player.removeEventListener('animationend', handler);
        }, { once: true });

      } else if (jumpCount === 2) {
        player.classList.remove('jump1');
        player.classList.add('jump2');

        player.addEventListener('animationend', function handler() {
          player.classList.remove('jump2');
          jumpCount = 0;
          canJump = true;
          player.style.bottom = '21vh';
          player.removeEventListener('animationend', handler);
        }, { once: true });
      }
    }, 0); // 延遲 100 毫秒判斷跳躍
  }
});

let elapsedSeconds = 0;

function startObstacleSpawner() {
  obstacleInterval = setInterval(() => {
    elapsedSeconds++;

    // 判斷要生成幾個障礙物
    let spawnCount = 0;
    if (elapsedSeconds % 7 === 0 || elapsedSeconds % 5 === 0 || elapsedSeconds % 2 === 0) {
        spawnCount = 1;
    }

    for (let i = 0; i < spawnCount; i++) {
      spawnObstacle();
    }
  }, 1000); // 每秒判斷一次
}

function spawnObstacle() {
  const obstacleContainer = document.getElementById('obstacles');

  const obstacle = document.createElement('img');
  obstacle.src = './image/obstacle.png';
  obstacle.classList.add('obstacle');

  // 設定初始位置在螢幕外右側
  const startLeft = window.innerWidth;
  obstacle.style.left = `${startLeft}px`;

  obstacleContainer.appendChild(obstacle);
  activeObstacles.push(obstacle);

  moveObstacle(obstacle);
}

function moveObstacle(obstacle) {
  let x = window.innerWidth;

  function step() {
    x -= obstacleSpeed;
    obstacle.style.left = `${x}px`;

    // === 碰撞檢查 ===
    const player = document.getElementById('player');
    if (checkCollision(player, obstacle)) {
      stopGame(); // 結束遊戲
      return;
    }

    // === 出界移除 ===
    if (x + obstacle.offsetWidth < 0) {
      obstacle.remove();
      activeObstacles = activeObstacles.filter(o => o !== obstacle);
      return;
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function checkCollision(player, obstacle) {
  const pRect = player.getBoundingClientRect();
  const oRect = obstacle.getBoundingClientRect();

  return !(
    pRect.right < oRect.left ||    // player 在 obstacle 左邊
    pRect.left > oRect.right ||    // player 在 obstacle 右邊
    pRect.bottom < oRect.top ||    // player 在 obstacle 上方
    pRect.top > oRect.bottom       // player 在 obstacle 下方
  );
}

let bgX = 0;
let bgSpeed = 2; // 背景滾動速度
let bgAnimating = false;

function animateBackground() {
  if (!bgAnimating) return;

  bgX -= bgSpeed;
  if (bgX <= -window.innerWidth) {
    bgX = 0;
  }
  const bgContainer = document.getElementById('bg-container');
  bgContainer.style.transform = `translateX(${bgX}px)`;

  requestAnimationFrame(animateBackground);
}

function stopGame() {
  clearInterval(obstacleInterval);
  document.getElementById('game-over-screen').classList.remove('hidden');
  document.getElementById('game-screen').classList.add('hidden');

  // 加上 dimmed class，讓背景變暗
  document.getElementById('bg-container').classList.add('dimmed');

  clearInterval(obstacleInterval);
  activeObstacles.forEach(ob => ob.remove());
  activeObstacles = [];

  stopTimer();  // 停止計時器
  showScreen(gameOverScreen);
}

const scoreTimer = document.getElementById('score-timer');
let timerInterval;
let secondsElapsed = 0;

// 將秒數轉成 mm:ss 字串
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  // 補零成兩位數字
  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');
  return `${minsStr}:${secsStr}`;
}

function startTimer() {
  secondsElapsed = 0;
  scoreTimer.textContent = `${formatTime(secondsElapsed)}`;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    scoreTimer.textContent = `${formatTime(secondsElapsed)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}


// 初始狀態顯示起始畫面
showStartScreen();