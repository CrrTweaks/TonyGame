import Enemy from '../entities/Enemy.js'; 

export default class WaveSystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = this.scene.physics.add.group(); // Gruppo di nemici
    this.enemyCount = 0; // Numero totale di nemici da spawnare
    this.waveNumber = 1; // Numero dell'onda attuale
  }

  startWave(waveNumber) {
    this.waveNumber = waveNumber;
    this.enemyCount = waveNumber * 5; // Numero di nemici in base al numero dell'onda

    for (let i = 0; i < this.enemyCount; i++) {
      this.createEnemy();
    }
  }

  createEnemy() {
    const enemy = new Enemy(this.scene, Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500), this.scene.player);

    // Aggiungi il nemico alla fisica
    this.scene.physics.add.existing(enemy);
    
    // Aggiungi il nemico al gruppo di nemici
    this.enemies.add(enemy);  

    return enemy;
  }

  increaseDifficulty() {
    this.enemyCount += Phaser.Math.Between(5, 10); // Aumenta il numero di nemici in modo casuale
    for (let i = 0; i < Phaser.Math.Between(3, 5); i++) {
      this.createEnemy(); // Aggiungi nuovi nemici
    }
  }

  increaseEnemyCount(kills) {
    if (kills % 25 === 0) { // Aumenta la difficoltà ogni 25 uccisioni
      this.waveNumber++; // Incrementa il numero dell'onda
      this.startWave(this.waveNumber); // Crea nuovi nemici per la nuova onda
      this.increaseDifficulty(); // Aumenta la difficoltà
    }
  }

  update() {
    // Logiche di aggiornamento aggiuntive, se necessarie
  }
}
