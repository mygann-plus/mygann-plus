import { GameSpace } from "./Gamespace";

export default class Controller {
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  hidden: boolean;
  gameSpace: GameSpace;

  constructor(width: number, height: number, color: string, x: number, y: number, gameSpace: GameSpace) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
    this.hidden = true; // Default to hidden
    this.gameSpace = gameSpace;
  }

  setVisible(visible: boolean): void {
    this.hidden = !visible;
  }

  update(): void {
    if (this.hidden) return; // Skip rendering if hidden
    const ctx = this.gameSpace.context;
    if (!ctx) {
      throw new Error('Canvas context is not initialized. Call gameSpace.start() first.');
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
