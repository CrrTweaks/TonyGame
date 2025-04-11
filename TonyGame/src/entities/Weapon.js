import Phaser from 'phaser';

export default class Weapon {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    
    // Configurazione arma
    this.cooldown = 500; // Millisecondi tra spari
    this.lastFired = 0;
    this.damage = 1;
    this.bulletSpeed = 500;
    this.bulletSize = 0.3;

    // Gruppo ottimizzato per i proiettili
    this.bullets = this.scene.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20,
      runChildUpdate: true
    });

    // Suono sparo
    this.shotSound = this.scene.sound.add('shoot', { volume: 0.2 });
  }

  fire(angle) {
    // Ottieni proiettile dal pool
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');

    if (!bullet) return;

    // Configura il proiettile
    bullet.setActive(true)
          .setVisible(true)
          .setScale(this.bulletSize)
          .setRotation(angle)
          .setData('damage', this.damage);

    bullet.body.reset(this.player.x, this.player.y); // assicura posizione corretta

    bullet.setVelocity(
      Math.cos(angle) * this.bulletSpeed,
      Math.sin(angle) * this.bulletSpeed
    );

    // Nascondi dopo 1 secondo (non distrugge)
    this.scene.time.delayedCall(1000, () => {
      if (bullet.active) {
        bullet.setActive(false).setVisible(false);
        bullet.body.stop();
      }
    });

    this.shotSound.play();
  }

  // update rimosso (spariamo solo su click)
  update() {
    // Disabilita i proiettili che escono dai limiti della scena
    this.bullets.children.iterate((bullet) => {
      if (!bullet.active) return;
      
      // Verifica se il proiettile è fuori dalla scena
      if (
        bullet.x < 0 || bullet.x > this.scene.sys.game.config.width ||
        bullet.y < 0 || bullet.y > this.scene.sys.game.config.height
      ) {
        bullet.setActive(false).setVisible(false);
        bullet.body.stop();
      }
    });
  }

  // Potenziamenti
  upgrade(property, value) {
    switch (property) {
      case 'damage':
        this.damage += value;
        break;
      case 'speed':
        this.cooldown = Math.max(100, this.cooldown - value);
        break;
      case 'size':
        this.bulletSize = Phaser.Math.Clamp(this.bulletSize + value, 0.2, 1.5);
        break;
    }
  }
}
