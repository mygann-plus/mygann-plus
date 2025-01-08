import { platform } from 'os';
import { GameSpace } from './Gamespace';

export enum PlatformType {
  Normal = 0,
  Jump = 1,
}

const platformColors: string[] = ['rgba(52, 227, 57,0.5)', 'rgba(247, 236, 22,0.5)'];

export default class Platform {
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  gameSpace: GameSpace;
  type: PlatformType;

  constructor(width: number, height: number, color: string, x: number, y: number, gameSpace: GameSpace, type: PlatformType) {
    this.width = width + 10;
    this.height = height + 10;
    this.x = x - 5;
    this.y = y - 5;
    this.color = color;
    this.gameSpace = gameSpace;
    this.type = type;
  }

  update(): void {
    const ctx = this.gameSpace.context;
    if (!ctx) {
      throw new Error('Canvas context is not initialized. Call gameSpace.start() first.');
    }
    ctx.beginPath();
    ctx.fillStyle = platformColors[this.type];
    ctx.roundRect(this.x, this.y, this.width, this.height, 7);
    ctx.fill();
  }
}
