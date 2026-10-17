// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    PLAYER_SPEED: 6,
    BULLET_SPEED: 10,
    ENEMY_BASE_SPEED: 2,
    SPAWN_RATE_INITIAL: 60,
    POWERUP_CHANCE: 0.15,
    MAX_LIVES: 3,
    STAR_COUNT: 100,
    PARTICLE_COUNT: 15
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
