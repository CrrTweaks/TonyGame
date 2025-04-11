export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, 'tony');
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Configurazione base
      this.setCollideWorldBounds(true);
      this.setScale(0.5);
      this.speed = 200;
    }
  
    update(cursors) {
      this.setVelocity(0);
  
      if (cursors.left?.isDown) {
        this.setVelocityX(-this.speed);
      } else if (cursors.right?.isDown) {
        this.setVelocityX(this.speed);
      }
  
      if (cursors.up?.isDown) {
        this.setVelocityY(-this.speed);
      } else if (cursors.down?.isDown) {
        this.setVelocityY(this.speed);
      }
    }
  }