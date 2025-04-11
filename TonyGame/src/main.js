// File: src/main.js
import Phaser from 'phaser'; // Importa il motore Phaser
import GameScene from './scenes/GameScene.js'; // Importa la scena principale

// Configurazione del gioco
const config = {
  type: Phaser.AUTO, // Scegli automaticamente WebGL o Canvas
  width: 800,  // Larghezza finestra
  height: 600, // Altezza finestra
  parent: 'game', // ID del div HTML dove montare il gioco
  physics: {
    default: 'arcade', // Fisica semplice per platformer
    arcade: { 
      gravity: { y: 0 }, // movimento totale (top-down)
      debug: true // Mostra hitbox (utile per debug)
    }
  },
  scene: [GameScene] // Lista delle scene (parte da GameScene)
};

// Crea l'istanza del gioco!
new Phaser.Game(config);