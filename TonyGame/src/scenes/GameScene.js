import Player from '../entities/Player.js';
import Weapon from '../entities/Weapon.js';
import WaveSystem from '../systems/WaveSystem.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    this.currentWave = 1;
    this.enemiesKilled = 0;
    this.gameOver = false;
  }

  preload() {
    this.load.image('tony', 'assets/images/tony.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.image('health_pack', 'assets/images/health_pack.png');
    
    this.load.audio('shoot', 'assets/audio/shoot.wav');
    this.load.audio('enemy_death', 'assets/audio/enemy_death.wav');
    this.load.audio('player_hit', 'assets/audio/player_hit.wav');
  }

  create() {
    this.player = new Player(this, 400, 300);
    this.player.setData('health', 10); 
    
    this.setupControls();
    
    this.weapon = new Weapon(this, this.player);
    this.waveSystem = new WaveSystem(this);

    // Aggiungi listener per l'evento di uccisione del nemico
    this.events.on('enemyKilled', this.onEnemyKilled, this);

    this.setupCollisions();
    this.setupUI();
    
    this.startNextWave();
  }

  update(time) {
    if (this.gameOver) return;
    
    this.player.update(this.cursors);
    this.weapon.update(time, this.input.activePointer);
    this.waveSystem.update();
  }

  setupControls() {
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    this.input.on('pointerdown', () => {
      if (!this.weapon.autofire) {
        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
          this.player.x, this.player.y,
          pointer.worldX, pointer.worldY
        );
        this.weapon.fire(angle);
      }
    });
  }

  setupCollisions() {
    this.physics.add.overlap(
      this.weapon.bullets,
      this.waveSystem.enemies,
      (bullet, enemy) => {
        if (enemy && enemy.takeDamage) { 
          const damage = bullet.getData('damage');
          console.log('Proiettile colpisce il nemico con danno:', damage);
          enemy.takeDamage(damage);
          bullet.setActive(false).setVisible(false);  // Nascondi il proiettile dopo che ha colpito
          
          if (enemy.health <= 0) {
            this.spawnNewEnemy();
          }
        }
      }
    );
    
    this.physics.add.collider(
      this.player,
      this.waveSystem.enemies,
      (player, enemy) => {
        player.takeDamage(1);
        this.sound.play('player_hit');
        
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          player.x, player.y
        );
        player.setVelocity(
          Math.cos(angle) * 200,
          Math.sin(angle) * 200
        );
      }
    );
  }

  spawnNewEnemy() {
    const newEnemy = this.waveSystem.createEnemy();  // Crea il nuovo nemico
    
    // Assicurati che il nemico sia aggiunto alla fisica
    this.physics.add.existing(newEnemy);  
    this.waveSystem.enemies.add(newEnemy);  // Aggiungi il nemico al gruppo di nemici
    
    // Verifica che il nemico abbia la proprietà 'body'
    if (newEnemy.body) {
      console.log('Nemico creato correttamente con body:', newEnemy.body);
    } else {
      console.error('Errore nella creazione del nemico: manca il body');
    }
  }

  spawnPowerUp(x, y) {
    const powerUp = this.physics.add.sprite(x, y, 'health_pack');
    
    powerUp.collect = (player) => {
      player.heal(2);  // Ripristina 2 punti vita al giocatore
      this.updateHealthBar();  // Aggiorna la barra della salute
    };
  
    this.physics.add.overlap(this.player, powerUp, (player, powerUp) => {
      powerUp.collect(player);  // Colleziona il power-up quando il giocatore lo tocca
      powerUp.destroy();  // Distruggi il power-up dopo che è stato raccolto
    });
  }

  onEnemyKilled() {
    this.enemiesKilled++;
    this.sound.play('enemy_death');

    // 20% chance di spawnare power-up
    if (Phaser.Math.Between(1, 5) === 1) {
      this.spawnPowerUp();
    }

    // Ogni 25 uccisioni, aumenta la difficoltà e spawna nuovi nemici
    if (this.enemiesKilled % 25 === 0) {
      this.startNextWave();
      this.waveSystem.increaseEnemyCount(this.enemiesKilled); // Aumenta il numero di nemici
    }
  }

  startNextWave() {
    this.currentWave++;
    this.waveSystem.startWave(this.currentWave);  // Avvia la nuova onda
    this.waveText.setText(`Wave: ${this.currentWave}`);
    
    // Potenzia l'arma ogni 3 onde
    if (this.currentWave % 3 === 0) {
      this.weapon.upgrade('damage', 1);
    }
  }

  setupUI() {
    this.waveText = this.add.text(20, 20, 'Wave: 1', {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    this.healthBar = this.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    const health = this.player.getData('health');
    this.healthBar.clear()
      .fillStyle(0x000000)
      .fillRect(20, 50, 200, 20)
      .fillStyle(0xff0000)
      .fillRect(20, 50, 200 * (health / 10), 20);
  }

  gameOver() {
    this.gameOver = true;
    this.physics.pause();
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    }).setOrigin(0.5);
  }
}
