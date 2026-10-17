// ==================== SPRITE GENERATOR ====================

class SpriteGenerator {
    static createPlayerShip() {
        const size = 60;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tctx = tempCanvas.getContext('2d');
        
        // Main body
        const gradient = tctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#00FFFF');
        gradient.addColorStop(0.5, '#0080FF');
        gradient.addColorStop(1, '#004080');
        
        tctx.fillStyle = gradient;
        tctx.beginPath();
        tctx.moveTo(size/2, 5);
        tctx.lineTo(size - 10, size - 10);
        tctx.lineTo(size/2, size - 5);
        tctx.lineTo(10, size - 10);
        tctx.closePath();
        tctx.fill();
        
        // Cockpit
        tctx.fillStyle = '#FFFFFF';
        tctx.beginPath();
        tctx.arc(size/2, size/2 - 5, 8, 0, Math.PI * 2);
        tctx.fill();
        
        // Engine glow
        tctx.fillStyle = '#FF6B00';
        tctx.beginPath();
        tctx.arc(size/2 - 10, size - 8, 5, 0, Math.PI * 2);
        tctx.arc(size/2 + 10, size - 8, 5, 0, Math.PI * 2);
        tctx.fill();
        
        return tempCanvas;
    }
    
    static createEnemy(type) {
        const size = 50;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tctx = tempCanvas.getContext('2d');
        
        if (type === 'basic') {
            // Red alien ship
            tctx.fillStyle = '#FF0040';
            tctx.beginPath();
            tctx.arc(size/2, size/2, 20, 0, Math.PI * 2);
            tctx.fill();
            
            tctx.fillStyle = '#FF6B6B';
            tctx.beginPath();
            tctx.arc(size/2, size/2, 12, 0, Math.PI * 2);
            tctx.fill();
            
            // Eyes
            tctx.fillStyle = '#FFFF00';
            tctx.beginPath();
            tctx.arc(size/2 - 6, size/2 - 3, 4, 0, Math.PI * 2);
            tctx.arc(size/2 + 6, size/2 - 3, 4, 0, Math.PI * 2);
            tctx.fill();
            
        } else if (type === 'fast') {
            // Purple speeder
            tctx.fillStyle = '#9B59B6';
            tctx.beginPath();
            tctx.moveTo(size/2, 5);
            tctx.lineTo(size - 5, size/2);
            tctx.lineTo(size/2, size - 5);
            tctx.lineTo(5, size/2);
            tctx.closePath();
            tctx.fill();
            
            tctx.fillStyle = '#E74C3C';
            tctx.beginPath();
            tctx.arc(size/2, size/2, 8, 0, Math.PI * 2);
            tctx.fill();
            
        } else if (type === 'tank') {
            // Green heavy ship
            tctx.fillStyle = '#27AE60';
            tctx.fillRect(5, 10, size - 10, size - 20);
            
            tctx.fillStyle = '#2ECC71';
            tctx.fillRect(10, 15, size - 20, size - 30);
            
            // Cannon
            tctx.fillStyle = '#1E8449';
            tctx.fillRect(size/2 - 3, 0, 6, 15);
        }
        
        return tempCanvas;
    }
    
    static createBullet() {
        const size = 20;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tctx = tempCanvas.getContext('2d');
        
        const gradient = tctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, '#00FFFF');
        gradient.addColorStop(1, 'transparent');
        
        tctx.fillStyle = gradient;
        tctx.beginPath();
        tctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        tctx.fill();
        
        return tempCanvas;
    }
    
    static createPowerUp(type) {
        const size = 40;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tctx = tempCanvas.getContext('2d');
        
        let color;
        switch(type) {
            case 'rapid': color = '#FF6B6B'; break;
            case 'shield': color = '#4ECDC4'; break;
            case 'multi': color = '#FFD93D'; break;
            default: color = '#FFFFFF';
        }
        
        // Glow effect
        tctx.shadowColor = color;
        tctx.shadowBlur = 15;
        
        tctx.fillStyle = color;
        tctx.beginPath();
        tctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
        tctx.fill();
        
        tctx.shadowBlur = 0;
        
        // Icon
        tctx.fillStyle = '#FFFFFF';
        tctx.font = 'bold 20px Arial';
        tctx.textAlign = 'center';
        tctx.textBaseline = 'middle';
        
        let icon;
        switch(type) {
            case 'rapid': icon = '🔥'; break;
            case 'shield': icon = '🛡️'; break;
            case 'multi': icon = '⚡'; break;
        }
        tctx.fillText(icon, size/2, size/2);
        
        return tempCanvas;
    }
    
    static createExplosion() {
        const size = 60;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tctx = tempCanvas.getContext('2d');
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = size/2 + Math.cos(angle) * 15;
            const y = size/2 + Math.sin(angle) * 15;
            
            tctx.fillStyle = `hsl(${Math.random() * 60}, 100%, 50%)`;
            tctx.beginPath();
            tctx.arc(x, y, 8, 0, Math.PI * 2);
            tctx.fill();
        }
        
        return tempCanvas;
    }
}

// Pre-generate sprites
const SPRITES = {
    player: SpriteGenerator.createPlayerShip(),
    enemyBasic: SpriteGenerator.createEnemy('basic'),
    enemyFast: SpriteGenerator.createEnemy('fast'),
    enemyTank: SpriteGenerator.createEnemy('tank'),
    bullet: SpriteGenerator.createBullet(),
    powerUpRapid: SpriteGenerator.createPowerUp('rapid'),
    powerUpShield: SpriteGenerator.createPowerUp('shield'),
    powerUpMulti: SpriteGenerator.createPowerUp('multi'),
    explosion: SpriteGenerator.createExplosion()
};
