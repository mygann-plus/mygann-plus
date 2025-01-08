import { GameSpace } from './Gamespace';

export default class Player {
  width: number;
  height: number;
  x: number;
  y: number;
  velX: number;
  velY: number;
  falling: boolean;
  color: string;
  gameSpace: GameSpace;
  image: HTMLImageElement;

  constructor(
    width: number,
    height: number,
    color: string,
    x: number,
    y: number,
    gameSpace: GameSpace,
  ) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.velX = 0;
    this.velY = 0;
    this.falling = true;
    this.color = color;

    this.gameSpace = gameSpace;
    this.image = new Image();
    this.image.src = 'https://www.clipartmax.com/png/middle/22-227378_super-mario-world-super-mario-world-mario-sprite.png';
  }

  update(): void {
    const ctx = this.gameSpace.context;
    if (!ctx) {
      throw new Error(
        'Canvas context is not initialized. Call gameSpace.start() first.',
      );
    }
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  updatePos(viewWidth: number, onPlatform: boolean): void {
    // Vertical Positioning
    if (this.y + this.height < document.body.scrollHeight && !onPlatform) {
      this.falling = true;
    } else if (this.y + this.height === document.body.scrollHeight) {
      // console.log('empty block');
    } else {
      this.falling = false;
      if (!onPlatform) {
        this.y = document.body.scrollHeight - this.height;
      }
    }

    if (this.falling && this.velY < 40) {
      this.velY += 0.56;
    } else if (!this.falling) {
      this.velY = 0;
    }

    // Horizontal Positioning
    if (this.x + this.width < -5) {
      this.x = viewWidth + this.width;
    }

    if (this.x > viewWidth + this.width + 5) {
      this.x = -2 - this.width;
    }

    this.x += this.velX;
    this.y += this.velY;
  }
}
