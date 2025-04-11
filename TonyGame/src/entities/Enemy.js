import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, target) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);  // Aggiungi il nemico alla scena
    scene.physics.add.existing(this);  // Aggiungi fisica al nemico

    this.scene = scene;  // Assicurati che la scena sia correttamente assegnata
    this.target = target;  // Giocatore come obiettivo
    this.speed = Phaser.Math.Between(40, 80);  // Velocità casuale
    this.health = 3;  // Punti vita iniziali
    this.damage = 1;  // Danno al contatto con il giocatore

    // Configurazione fisica
    this.setCollideWorldBounds(true);
    this.setScale(0.7);
    this.setBodySize(30, 30);  // Hitbox

    // Effetto visivo quando colpito
    this.hitTint = 0xff0000;  // Rosso quando colpito
    this.normalTint = 0xffffff;  // Colore normale
  }

  takeDamage(damage) {
    this.health -= damage;

    // Effetto visivo quando il nemico è colpito
    this.setTint(this.hitTint);
    this.scene.time.delayedCall(100, () => this.setTint(this.normalTint));

    // Controlla se la salute è a zero o inferiore
    if (this.health <= 0) {
      console.log('Nemico distrutto', this);
      this.destroy();  // Distruggi il nemico

      // Emetti un evento quando il nemico è stato ucciso
      if (this.scene && this.scene.events) {
        this.scene.events.emit('enemyKilled');
      }

      // 20% di probabilità di far spawnare un power-up
      if (Phaser.Math.Between(1, 5) === 1) {
        // Controlliamo che this.scene sia definita e che spawnPowerUp esista
        if (this.scene && typeof this.scene.spawnPowerUp === 'function') {
          this.scene.spawnPowerUp(this.x, this.y);  // Chiama la funzione per spawnare il power-up
        }
      }
    }
  }

  update() {
    if (!this.target) return;

    // Movimento verso il giocatore
    if (Phaser.Math.Between(1, 10) <= 7) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    } else {
      // Movimento casuale
      this.setVelocity(
        Phaser.Math.Between(-this.speed, this.speed),
        Phaser.Math.Between(-this.speed, this.speed)
      );
    }

    // Rotazione del nemico verso la direzione di movimento
    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }
  }

  onPlayerCollision() {
    if (this.active) {
      this.scene.player.takeDamage(this.damage);  // Infligge danno al giocatore
      this.setVelocity(0);  // Knockback
      this.scene.time.delayedCall(200, () => {
        if (this.active) {
          this.speed *= 1.1;  // Aumenta la velocità dopo un attacco
        }
      });
    }
  }
}
