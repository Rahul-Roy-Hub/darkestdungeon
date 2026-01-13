import Phaser from 'phaser';

import { gameState } from '../state';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScene' });
  }

  preload() {
    this.load.image('background', '/background.png');
    this.load.image('logo', '/logo.png');
    this.load.image('single-button', '/single-button.png');
    this.load.image('multi-button', '/multi-button.png');
  }

  create() {
    console.log('HomeScene created');
    const { width, height } = this.scale;
    const bgImage = this.add.image(width / 2, height / 2, 'background');
    
    // Get the actual texture dimensions
    const texture = bgImage.texture;
    const source = texture.source[0];
    const bgWidth = source?.width ?? bgImage.width;
    const bgHeight = source?.height ?? bgImage.height;
    
    // Calculate scale to cover the entire viewport while maintaining aspect ratio
    const scaleX = width / bgWidth;
    const scaleY = height / bgHeight;
    const scale = Math.max(scaleX, scaleY);
    
    bgImage
      .setOrigin(0.5, 0.5)
      .setScale(scale);

    this.add
      .image(width / 2, height / 4, 'logo')
      .setScale(0.1)
      .setDepth(1);

    const descriptionText = `
Welcome to the Dungeon Game!
  
Explore a randomly generated dungeon with multiple rooms.
Find loot and battle monsters like archers and skeletons.

Your goal is to find the stairs to the next level!
Each level gets harder with bigger dungeons and stronger monsters.

You have three lives. Survive as long as you can!
Good luck!
`;

    const descriptionTextObj = this.add
      .text(width / 2, height / 2 + 40, descriptionText, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(1);

    const textBottom = descriptionTextObj.y + (descriptionTextObj.height / 2);
    const buttonSpacing = 80; // Space between buttons
    const textToButtonGap = 60; // Gap between text and first button

    // Add Start Game Button - positioned below description text
    const startButton = this.add
      .image(width / 2, textBottom + textToButtonGap, 'single-button')
      .setInteractive({ useHandCursor: true })
      .setScale(1)
      .setDepth(1);

    // Add Multiplayer Button - positioned below Single Player button
    const multiplayerButton = this.add
      .image(width / 2, textBottom + textToButtonGap + buttonSpacing, 'multi-button')
      .setInteractive({ useHandCursor: true })
      .setScale(1)
      .setDepth(1);

    // Set cursor style on hover for both buttons
    startButton.on('pointerover', () => {
      this.input.setDefaultCursor('url(/cursor-pointer.png), pointer');
    });

    startButton.on('pointerout', () => {
      this.input.setDefaultCursor('url(/cursor.png), auto');
    });

    multiplayerButton.on('pointerover', () => {
      this.input.setDefaultCursor('url(/cursor-pointer.png), pointer');
    });

    multiplayerButton.on('pointerout', () => {
      this.input.setDefaultCursor('url(/cursor.png), auto');
    });

    // Add button functionality
    startButton.on('pointerdown', () => {
      console.log('Single player button clicked');
      gameState.activeScene = 'game';
      this.scene.start('GameScene');
    });

    multiplayerButton.on('pointerdown', () => {
      console.log('Multiplayer button clicked - user action');
      this.scene.start('MultiplayerLobbyScene');
    });
  }
}
