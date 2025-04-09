// Game State
const gameState = {
  score: 0,
  timeLeft: 30,
  gameActive: false,
  player: {
    x: 50,
    y: 80,
    speed: 2,
    size: 1,
  },
  friends: [],
  enemies: [],
  particles: [],
  lastSpawn: {
    friend: 0,
    enemy: 0,
  },
  spawnRates: {
    friend: 1000,
    enemy: 2000,
  },
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
  },
};

// DOM Elements
const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const gameOverScreen = document.getElementById("game-over-screen");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const finalScoreDisplay = document.getElementById("final-score");
const resultMessage = document.getElementById("result-message");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const player = document.getElementById("player");
const gameArea = document.getElementById("game-area");

// Event Listeners
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchmove", handleTouchMove, { passive: false });

// Game Functions
function startGame() {
  // Reset game state
  gameState.score = 0;
  gameState.timeLeft = 30;
  gameState.player = {
    x: 50,
    y: 80,
    speed: 2,
    size: 1,
  };
  gameState.friends = [];
  gameState.enemies = [];
  gameState.particles = [];

  // Update UI
  scoreDisplay.textContent = gameState.score;
  timeDisplay.textContent = gameState.timeLeft;
  player.style.width = `${30 + gameState.player.size * 10}px`;
  player.style.height = `${30 + gameState.player.size * 10}px`;

  // Clear game area
  gameArea.innerHTML = "";
  gameArea.appendChild(player);

  // Show game screen
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  gameContainer.style.display = "block";

  // Position player
  updatePlayerPosition();

  // Start game
  gameState.gameActive = true;
  gameState.lastTime = performance.now();

  // Start timer
  const timer = setInterval(() => {
    if (!gameState.gameActive) {
      clearInterval(timer);
      return;
    }

    gameState.timeLeft--;
    timeDisplay.textContent = gameState.timeLeft;

    if (gameState.timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);

  // Start game loop
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!gameState.gameActive) return;

  const deltaTime = timestamp - gameState.lastTime;
  gameState.lastTime = timestamp;

  // Spawn friends and enemies
  if (timestamp - gameState.lastSpawn.friend > gameState.spawnRates.friend) {
    spawnFriend();
    gameState.lastSpawn.friend = timestamp;
    // Increase spawn rate as game progresses
    gameState.spawnRates.friend = Math.max(
      500,
      1000 - (30 - gameState.timeLeft) * 10
    );
  }

  if (timestamp - gameState.lastSpawn.enemy > gameState.spawnRates.enemy) {
    spawnEnemy();
    gameState.lastSpawn.enemy = timestamp;
    // Increase spawn rate as game progresses
    gameState.spawnRates.enemy = Math.max(
      1000,
      2000 - (30 - gameState.timeLeft) * 20
    );
  }

  // Move player
  if (gameState.keys.up)
    gameState.player.y = Math.max(
      10,
      gameState.player.y - gameState.player.speed
    );
  if (gameState.keys.down)
    gameState.player.y = Math.min(
      90,
      gameState.player.y + gameState.player.speed
    );
  if (gameState.keys.left)
    gameState.player.x = Math.max(
      5,
      gameState.player.x - gameState.player.speed
    );
  if (gameState.keys.right)
    gameState.player.x = Math.min(
      95,
      gameState.player.x + gameState.player.speed
    );

  updatePlayerPosition();

  // Update friends
  updateFriends();

  // Update enemies
  updateEnemies();

  // Update particles
  updateParticles();

  requestAnimationFrame(gameLoop);
}

function updatePlayerPosition() {
  player.style.left = `${gameState.player.x}%`;
  player.style.top = `${gameState.player.y}%`;
}

function spawnFriend() {
  const friend = document.createElement("div");
  friend.className = "mochi mochi-friend";
  friend.innerHTML = `
      <div class="mochi__wrapper">
          <div class="mochi__body"></div>
      </div>
  `;

  // Position randomly around edges
  let x, y;
  const edge = Math.floor(Math.random() * 4);

  switch (edge) {
    case 0:
      x = 0;
      y = Math.random() * 100;
      break;
    case 1:
      x = 100;
      y = Math.random() * 100;
      break;
    case 2:
      x = Math.random() * 100;
      y = 0;
      break;
    case 3:
      x = Math.random() * 100;
      y = 100;
      break;
  }

  friend.style.left = `${x}%`;
  friend.style.top = `${y}%`;

  gameArea.appendChild(friend);

  gameState.friends.push({
    element: friend,
    x,
    y,
    speed: 0.5 + Math.random(),
    direction: Math.random() * Math.PI * 2,
  });
}

function spawnEnemy() {
  const enemy = document.createElement("div");
  enemy.className = "mochi mochi-enemy";
  enemy.innerHTML = `
      <div class="mochi__wrapper">
          <div class="mochi__body"></div>
      </div>
  `;

  // Position randomly around edges
  let x, y;
  const edge = Math.floor(Math.random() * 4);

  switch (edge) {
    case 0:
      x = 0;
      y = Math.random() * 100;
      break;
    case 1:
      x = 100;
      y = Math.random() * 100;
      break;
    case 2:
      x = Math.random() * 100;
      y = 0;
      break;
    case 3:
      x = Math.random() * 100;
      y = 100;
      break;
  }

  enemy.style.left = `${x}%`;
  enemy.style.top = `${y}%`;

  gameArea.appendChild(enemy);

  gameState.enemies.push({
    element: enemy,
    x,
    y,
    speed: 0.3 + Math.random() * 0.4,
  });
}

function updateFriends() {
  const playerX = gameState.player.x;
  const playerY = gameState.player.y;
  const playerSize = gameState.player.size;

  gameState.friends.forEach((friend, index) => {
    // Move in random direction but slightly away from player
    const dx = friend.x - playerX;
    const dy = friend.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Change direction occasionally
    if (Math.random() < 0.02) {
      friend.direction = Math.random() * Math.PI * 2;
    }

    // Move away if player is close
    if (distance < 20) {
      const angle = Math.atan2(dy, dx);
      friend.x += Math.cos(angle) * friend.speed;
      friend.y += Math.sin(angle) * friend.speed;
    } else {
      // Move randomly
      friend.x += Math.cos(friend.direction) * friend.speed;
      friend.y += Math.sin(friend.direction) * friend.speed;
    }

    // Keep within bounds
    friend.x = Math.max(0, Math.min(100, friend.x));
    friend.y = Math.max(0, Math.min(100, friend.y));

    // Update position
    friend.element.style.left = `${friend.x}%`;
    friend.element.style.top = `${friend.y}%`;

    // Check collision with player
    if (distance < 10 + playerSize * 5) {
      collectFriend(friend, index);
    }

    // Remove if too far away
    if (distance > 150) {
      gameArea.removeChild(friend.element);
      gameState.friends.splice(index, 1);
    }
  });
}

function collectFriend(friend, index) {
  // Increase score and size
  gameState.score++;
  gameState.player.size += 0.1;
  scoreDisplay.textContent = gameState.score;

  // Update player size
  player.style.width = `${30 + gameState.player.size * 10}px`;
  player.style.height = `${30 + gameState.player.size * 10}px`;

  // Create particles
  createParticles(friend.x, friend.y, "#f8a5c2");

  // Remove friend
  gameArea.removeChild(friend.element);
  gameState.friends.splice(index, 1);

  // Visual feedback
  player.classList.add("collect-effect");
  setTimeout(() => player.classList.remove("collect-effect"), 300);
}

function updateEnemies() {
  const playerX = gameState.player.x;
  const playerY = gameState.player.y;
  const playerSize = gameState.player.size;

  gameState.enemies.forEach((enemy, index) => {
    // Move toward player
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    // Update position
    enemy.element.style.left = `${enemy.x}%`;
    enemy.element.style.top = `${enemy.y}%`;

    // Check collision with player
    if (distance < 10 + playerSize * 5) {
      hitByEnemy(enemy, index);
    }

    // Remove if out of bounds
    if (enemy.x < -10 || enemy.x > 110 || enemy.y < -10 || enemy.y > 110) {
      gameArea.removeChild(enemy.element);
      gameState.enemies.splice(index, 1);
    }
  });
}

function hitByEnemy(enemy, index) {
  // Decrease size
  gameState.player.size = Math.max(0.5, gameState.player.size - 0.3);
  player.style.width = `${30 + gameState.player.size * 10}px`;
  player.style.height = `${30 + gameState.player.size * 10}px`;

  // Create particles
  createParticles(enemy.x, enemy.y, "#ff6b6b");

  // Remove enemy
  gameArea.removeChild(enemy.element);
  gameState.enemies.splice(index, 1);

  // Visual feedback
  player.style.backgroundColor = "#ff6b6b";
  setTimeout(() => {
    player.style.backgroundColor = "#f8a5c2";
  }, 200);
}

function createParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.className =
      color === "#ff6b6b" ? "particle enemy-particle" : "particle";
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;

    const size = 3 + Math.random() * 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    gameArea.appendChild(particle);

    gameState.particles.push({
      element: particle,
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      life: 20 + Math.random() * 10,
    });
  }
}

function updateParticles() {
  gameState.particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;

    particle.element.style.left = `${particle.x}%`;
    particle.element.style.top = `${particle.y}%`;
    particle.element.style.opacity = particle.life / 30;

    if (particle.life <= 0) {
      gameArea.removeChild(particle.element);
      gameState.particles.splice(index, 1);
    }
  });
}

function endGame() {
  gameState.gameActive = false;

  // Update final score
  finalScoreDisplay.textContent = gameState.score;

  // Set result message
  if (gameState.score >= 20) {
    resultMessage.textContent = "Mochi Master!";
    resultMessage.style.color = "#7ea674";
  } else if (gameState.score >= 10) {
    resultMessage.textContent = "Good Job!";
    resultMessage.style.color = "#f8a5c2";
  } else {
    resultMessage.textContent = "Try Again!";
    resultMessage.style.color = "#ff6b6b";
  }

  // Show game over screen
  gameContainer.style.display = "none";
  gameOverScreen.style.display = "flex";
}

// Input Handling
function handleKeyDown(e) {
  if (!gameState.gameActive) return;

  switch (e.key) {
    case "ArrowUp":
    case "w":
      gameState.keys.up = true;
      break;
    case "ArrowDown":
    case "s":
      gameState.keys.down = true;
      break;
    case "ArrowLeft":
    case "a":
      gameState.keys.left = true;
      break;
    case "ArrowRight":
    case "d":
      gameState.keys.right = true;
      break;
  }
}

function handleKeyUp(e) {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      gameState.keys.up = false;
      break;
    case "ArrowDown":
    case "s":
      gameState.keys.down = false;
      break;
    case "ArrowLeft":
    case "a":
      gameState.keys.left = false;
      break;
    case "ArrowRight":
    case "d":
      gameState.keys.right = false;
      break;
  }
}

let touchX = 0;
let touchY = 0;
function handleTouchStart(e) {
  if (!gameState.gameActive) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = gameArea.getBoundingClientRect();
  touchX = ((touch.clientX - rect.left) / rect.width) * 100;
  touchY = ((touch.clientY - rect.top) / rect.height) * 100;
}

function handleTouchMove(e) {
  if (!gameState.gameActive) return;
  e.preventDefault();

  const touch = e.touches[0];
  const rect = gameArea.getBoundingClientRect();
  const newTouchX = ((touch.clientX - rect.left) / rect.width) * 100;
  const newTouchY = ((touch.clientY - rect.top) / rect.height) * 100;

  // Calculate movement direction
  const dx = newTouchX - touchX;
  const dy = newTouchY - touchY;

  // Move player based on touch movement
  gameState.player.x = Math.max(5, Math.min(95, gameState.player.x + dx));
  gameState.player.y = Math.max(10, Math.min(90, gameState.player.y + dy));

  touchX = newTouchX;
  touchY = newTouchY;
}
