// ==================== GAME STATE ====================

let gameState = 'MENU';
let score = 0;
let highScore = parseInt(localStorage.getItem('galaxyDefenderHighScore')) || 0;
let enemiesDestroyed = 0;
let frameCount = 0;
let spawnRate = CONFIG.SPAWN_RATE_INITIAL;

let player;
let bullets = [];
let enemies = [];
let powerUps = [];
let particles = [];
let stars = [];

// Initialize stars
for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
    stars.push(new Star());
}

// ==================== UI FUNCTIONS ====================

function updateLivesUI() {
    const livesBox = document.getElementById('livesBox');
    livesBox.innerHTML = '';
    for (let i = 0; i < player.lives; i++) {
        const life = document.createElement('div');
        life.className = 'life-icon';
        livesBox.appendChild(life);
    }
}

function updatePowerupUI(type, active) {
    const element = document.getElementById(type === 'rapid' ? 'rapidFire' : type === 'shield' ? 'shield' : 'multiShot');
    if (element) {
        if (active) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    }
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = score.toLocaleString();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    if (screenId !== 'none') {
        document.getElementById(screenId).classList.remove('hidden');
    }
}

// ==================== COLLISION DETECTION ====================

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function createExplosion(x, y, color = 'rgb(255, 100, 50)') {
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// ==================== GAME LOGIC ====================

function spawnEnemy() {
    const rand = Math.random();
    let type;
    
    if (rand < 0.6) {
        type = 'basic';
    } else if (rand < 0.85) {
        type = 'fast';
    } else {
        type = 'tank';
    }
    
    enemies.push(new Enemy(type));
}

function handleCollisions() {
    const playerBounds = player.getBounds();
    
    bullets.filter(b => b.isPlayer && b.active).forEach(bullet => {
        const bulletBounds = bullet.getBounds();
        
        enemies.forEach(enemy => {
            if (enemy.active && checkCollision(bulletBounds, enemy.getBounds())) {
                bullet.active = false;
                
                if (enemy.takeDamage()) {
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    score += enemy.score;
                    enemiesDestroyed++;
                    updateScore();
                    
                    if (Math.random() < CONFIG.POWERUP_CHANCE) {
                        powerUps.push(new PowerUp(enemy.x, enemy.y));
                    }
                }
            }
        });
    });
    
    bullets.filter(b => !b.isPlayer && b.active).forEach(bullet => {
        const bulletBounds = bullet.getBounds();
        
        if (checkCollision(bulletBounds, playerBounds)) {
            bullet.active = false;
            const gameOver = player.takeDamage();
            updateLivesUI();
            createExplosion(player.x + player.width/2, player.y + player.height/2, 'rgb(0, 255, 255)');
            
            if (gameOver) {
                endGame();
            }
        }
    });
    
    enemies.forEach(enemy => {
        if (enemy.active && checkCollision(enemy.getBounds(), playerBounds)) {
            enemy.active = false;
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            
            const gameOver = player.takeDamage();
            updateLivesUI();
            
            if (gameOver) {
                endGame();
            }
        }
    });
    
    powerUps.forEach(powerup => {
        if (powerup.active && checkCollision(powerup.getBounds(), playerBounds)) {
            powerup.active = false;
            player.activatePowerUp(powerup.type);
            score += 50;
            updateScore();
        }
    });
}

function update() {
    if (gameState !== 'PLAYING') return;
    
    frameCount++;
    
    if (frameCount % Math.floor(spawnRate) === 0) {
        spawnEnemy();
        
        if (spawnRate > 20) {
            spawnRate -= 0.1;
        }
    }
    
    stars.forEach(star => star.update());
    
    const newBullets = player.update();
    bullets.push(...newBullets);
    
    bullets.forEach(bullet => bullet.update());
    bullets = bullets.filter(b => b.active);
    
    enemies.forEach(enemy => {
        const bullet = enemy.update();
        if (bullet) bullets.push(bullet);
    });
    enemies = enemies.filter(e => e.active);
    
    powerUps.forEach(p => p.update());
    powerUps = powerUps.filter(p => p.active);
    
    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0);
    
    handleCollisions();
}

function draw() {
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => star.draw());
    
    if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        powerUps.forEach(p => p.draw());
        bullets.forEach(b => b.draw());
        enemies.forEach(e => e.draw());
        player.draw();
        particles.forEach(p => p.draw());
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ==================== GAME CONTROL ====================

function startGame() {
    player = new Player();
    bullets = [];
    enemies = [];
    powerUps = [];
    particles = [];
    score = 0;
    enemiesDestroyed = 0;
    frameCount = 0;
    spawnRate = CONFIG.SPAWN_RATE_INITIAL;
    
    updateScore();
    updateLivesUI();
    
    ['rapid', 'shield', 'multi'].forEach(type => updatePowerupUI(type, false));
    
    gameState = 'PLAYING';
    showScreen('none');
}

function endGame() {
    gameState = 'GAMEOVER';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('galaxyDefenderHighScore', highScore);
    }
    
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('enemiesDestroyed').textContent = enemiesDestroyed;
    document.getElementById('highScore').textContent = highScore.toLocaleString();
    
    setTimeout(() => {
        showScreen('gameOverScreen');
    }, 1000);
}

function pauseGame() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        showScreen('pauseScreen');
    }
}

function resumeGame() {
    if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        showScreen('none');
    }
}

// ==================== INPUT HANDLING ====================

let isDragging = false;

function handleInput(e) {
    e.preventDefault();
    
    let clientX;
    if (e.touches) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }
    
    if (player && gameState === 'PLAYING') {
        player.targetX = clientX - player.width / 2;
    }
}

canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    handleInput(e);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (isDragging) handleInput(e);
}, { passive: false });

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleInput(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) handleInput(e);
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && gameState === 'PLAYING') {
        pauseGame();
    } else if (e.code === 'Escape' && gameState === 'PAUSED') {
        resumeGame();
    }
});

document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// ==================== INITIALIZATION ====================

updateLivesUI();
document.getElementById('highScore').textContent = highScore.toLocaleString();
gameLoop();
