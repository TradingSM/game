const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

let player, enemy, round, score;

function resetGame() {
  round = 1;
  score = 0;
  player = createFighter(50, HEIGHT - 100, true);
  enemy = createFighter(WIDTH - 100, HEIGHT - 100, false);
  spawnEnemyDifficulty();
}

function createFighter(x, y, isPlayer) {
  return {
    x, y,
    width: 40,
    height: 60,
    health: 100,
    stamina: 100,
    maxHealth: 100,
    maxStamina: 100,
    dir: isPlayer ? 1 : -1,
    blocking: false,
    attacking: false,
    attackCooldown: 0,
    speed: 3,
  };
}

function spawnEnemyDifficulty() {
  enemy.health = 100 + round * 10;
  enemy.speed = 1.5 + round * 0.2;
  enemy.stamina = 100;
}

function update() {
  if (player.health <= 0) {
    resetGame();
  }

  // Player Controls
  if (keys['a']) player.x -= player.speed;
  if (keys['d']) player.x += player.speed;
  if (keys[' ']) block(player, true);
  else player.blocking = false;

  if (keys['k'] && player.attackCooldown <= 0) attack(player, enemy);

  if (!player.blocking) player.stamina = Math.min(player.maxStamina, player.stamina + 0.5);
  if (player.attackCooldown > 0) player.attackCooldown--;

  // Enemy AI
  enemyAI();

  draw();
}

function attack(attacker, defender) {
  if (attacker.stamina < 20) return;
  attacker.attacking = true;
  attacker.attackCooldown = 30;
  attacker.stamina -= 20;

  if (Math.abs(attacker.x - defender.x) < 50 && !defender.blocking) {
    defender.health -= 10;
  } else if (Math.abs(attacker.x - defender.x) < 50 && defender.blocking) {
    defender.stamina -= 10;
  }
}

function block(fighter, isPlayer) {
  fighter.blocking = true;
  fighter.stamina = Math.max(0, fighter.stamina - 0.5);
}

function enemyAI() {
  const dist = enemy.x - player.x;
  if (Math.abs(dist) > 50) {
    enemy.x += -enemy.speed * Math.sign(dist);
  } else if (enemy.attackCooldown <= 0 && enemy.stamina > 0) {
    attack(enemy, player);
  }
  if (!enemy.blocking) enemy.stamina = Math.min(enemy.maxStamina, enemy.stamina + 0.5);
  if (enemy.attackCooldown > 0) enemy.attackCooldown--;
}

function drawBar(x, y, w, h, value, max, color) {
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, (value / max) * w, h);
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Background
  ctx.fillStyle = '#444';
  ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);

  // Fighters
  drawFighter(player, '#4f4');
  drawFighter(enemy, '#f44');

  // UI
  drawBar(20, 20, 200, 10, player.health, player.maxHealth, '#0f0');
  drawBar(20, 35, 200, 10, player.stamina, player.maxStamina, '#ff0');

  drawBar(WIDTH - 220, 20, 200, 10, enemy.health, enemy.maxHealth, '#f00');
  drawBar(WIDTH - 220, 35, 200, 10, enemy.stamina, enemy.maxStamina, '#ff0');

  ctx.fillStyle = '#fff';
  ctx.fillText(`Round: ${round} | Score: ${score}`, WIDTH / 2 - 60, 20);

  // Next Round
  if (enemy.health <= 0) {
    round++;
    score += 100;
    player.health = player.maxHealth;
    player.stamina = player.maxStamina;
    enemy.x = WIDTH - 100;
    spawnEnemyDifficulty();
  }
}

function drawFighter(f, color) {
  ctx.fillStyle = color;
  ctx.fillRect(f.x, f.y, f.width, f.height);
  if (f.blocking) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(f.x - 5, f.y, 5, f.height);
  }
}

function loop() {
  update();
  requestAnimationFrame(loop);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

resetGame();
loop();
