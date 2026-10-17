// ==================== GAME CLASSES ====================

class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 2 + 1;
        this.brightness = Math.random();
    }
    
    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.reset();
        }
    }
    
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life--;
        this.size *= 0.95;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y, isPlayer = true) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = isPlayer ? -CONFIG.BULLET_SPEED : CONFIG.BULLET_SPEED * 0.6;
        this.isPlayer = isPlayer;
        this.active = true;
    }
    
    update() {
        this.y += this.speed;
        
        if (this.y < -50 || this.y > canvas.height + 50) {
            this.active = false;
        }
    }
    
    draw() {
        ctx.drawImage(SPRITES.bullet, this.x - 10, this.y - 10);
    }
    
    getBounds() {
        return {
            x: this.x - 10,
            y: this.y - 10,
            width: 20,
            height: 20
        };
    }
}

class Enemy {
    constructor(type) {
        this.type = type;
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -60;
        this.active = true;
        this.shootTimer = 0;
        
        switch(type) {
            case 'basic':
                this.speed = CONFIG.ENEMY_BASE_SPEED;
                this.health = 1;
                this.score = 100;
                this.sprite = SPRITES.enemyBasic;
                break;
            case 'fast':
                this.speed = CONFIG.ENEMY_BASE_SPEED * 1.8;
                this.health = 1;
                this.score = 150;
                this.sprite = SPRITES.enemyFast;
                break;
            case 'tank':
                this.speed = CONFIG.ENEMY_BASE_SPEED * 0.6;
                this.health = 3;
                this.score = 300;
                this.sprite = SPRITES.enemyTank;
                break;
        }
    }
    
    update() {
        this.y += this.speed;
        
        if (this.type === 'tank') {
            this.shootTimer++;
            if (this.shootTimer > 120) {
                this.shootTimer = 0;
                return new Bullet(this.x + this.width/2, this.y + this.height, false);
            }
        }
        
        if (this.y > canvas.height + 60) {
            this.active = false;
        }
        
        return null;
    }
    
    draw() {
        ctx.drawImage(this.sprite, this.x, this.y);
        
        if (this.type === 'tank' && this.health < 3) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x, this.y - 10, this.width, 5);
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.x, this.y - 10, this.width * (this.health / 3), 5);
        }
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.active = false;
            return true;
        }
        return false;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.active = true;
        this.speed = 2;
        
        const types = ['rapid', 'shield', 'multi'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        switch(this.type) {
            case 'rapid': this.sprite = SPRITES.powerUpRapid; break;
            case 'shield': this.sprite = SPRITES.powerUpShield; break;
            case 'multi': this.sprite = SPRITES.powerUpMulti; break;
        }
    }
    
    update() {
        this.y += this.speed;
        if (this.y > canvas.height + 50) {
            this.active = false;
        }
    }
    
    draw() {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Player {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 150;
        this.targetX = this.x;
        this.lives = CONFIG.MAX_LIVES;
        this.shootTimer = 0;
        this.shootRate = 15;
        
        this.powerUps = {
            rapid: { active: false, timer: 0 },
            shield: { active: false, timer: 0 },
            multi: { active: false, timer: 0 }
        };
    }
    
    update() {
        this.x += (this.targetX - this.x) * 0.2;
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        
        for (let key in this.powerUps) {
            if (this.powerUps[key].active) {
                this.powerUps[key].timer--;
                if (this.powerUps[key].timer <= 0) {
                    this.powerUps[key].active = false;
                    updatePowerupUI(key, false);
                }
            }
        }
        
        this.shootTimer++;
        const currentShootRate = this.powerUps.rapid.active ? 8 : this.shootRate;
        
        if (this.shootTimer >= currentShootRate) {
            this.shootTimer = 0;
            return this.shoot();
        }
        
        return [];
    }
    
    shoot() {
        const bullets = [];
        
        if (this.powerUps.multi.active) {
            bullets.push(new Bullet(this.x + this.width/2, this.y));
            bullets.push(new Bullet(this.x + 10, this.y + 10));
            bullets.push(new Bullet(this.x + this.width - 10, this.y + 10));
        } else {
            bullets.push(new Bullet(this.x + this.width/2, this.y));
        }
        
        return bullets;
    }
    
    activatePowerUp(type) {
        this.powerUps[type].active = true;
        this.powerUps[type].timer = 600;
        updatePowerupUI(type, true);
    }
    
    takeDamage() {
        if (this.powerUps.shield.active) {
            this.powerUps.shield.active = false;
            updatePowerupUI('shield', false);
            return false;
        }
        
        this.lives--;
        return this.lives <= 0;
    }
    
    draw() {
        if (this.powerUps.shield.active) {
            ctx.strokeStyle = '#4ECDC4';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 40, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(78, 205, 196, 0.2)';
            ctx.fill();
        }
        
        ctx.drawImage(SPRITES.player, this.x, this.y);
        
        const flameHeight = 10 + Math.random() * 10;
        ctx.fillStyle = '#FF6B00';
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y + this.height);
        ctx.lineTo(this.x + 20, this.y + this.height + flameHeight);
        ctx.lineTo(this.x + 25, this.y + this.height);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 35, this.y + this.height);
        ctx.lineTo(this.x + 40, this.y + this.height + flameHeight);
        ctx.lineTo(this.x + 45, this.y + this.height);
        ctx.fill();
    }
    
    getBounds() {
        return {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 20
        };
    }
}
