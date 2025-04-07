import { platform } from 'os';
import { GameSpace } from './Gamespace';

export enum PlatformType {
  Normal = 0,
  Jump = 1,
}

const platformColors: string[] = [
  'rgba(52, 227, 57,1)',
  'rgba(247, 236, 22,1)',
];
function shadeColor(color: string, percent: number): string {
  const rgbaMatch = color.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/,
  );
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;

    // Adjust each channel
    const adjust = (channel: number) =>
      Math.min(255, Math.max(0, channel + Math.round((percent / 100) * 255)));
    const newR = adjust(r);
    const newG = adjust(g);
    const newB = adjust(b);

    // Return the adjusted RGBA color
    return `rgba(${newR}, ${newG}, ${newB}, ${a})`;
  }
  // Validate the input color
  if (!/^#([0-9a-fA-F]{6})$/.test(color)) {
    throw new Error(`Invalid color format: ${color}`);
  }

  // Extract RGB values from the hex color
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // Adjust each channel
  const adjust = (channel: number) =>
    Math.min(255, Math.max(0, channel + Math.round((percent / 100) * 255)));
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Return the new hex color
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export default class Platform {
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
  gameSpace: GameSpace;
  type: PlatformType;

  constructor(
    width: number,
    height: number,
    color: string,
    x: number,
    y: number,
    gameSpace: GameSpace,
    type: PlatformType,
  ) {
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
      throw new Error(
        'Canvas context is not initialized. Call gameSpace.start() first.',
      );
    }
    // Set shadow properties
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Shadow color with transparency
    ctx.shadowOffsetX = 10; // Horizontal shadow offset
    ctx.shadowOffsetY = 10; // Vertical shadow offset
    ctx.shadowBlur = 15;

    // Draw the shadow as a rectangle with rounded corners
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 7);
    ctx.fill();

    // Remove shadow effect
    ctx.restore();

    // Draw the 3D platform with a top layer and a darker base for depth
    const depth = 7; // Depth of the 3D effect

    // Draw the base of the platform (darker part)
    ctx.fillStyle = shadeColor(platformColors[this.type], -10); // Darker color for the base
    ctx.beginPath();
    ctx.roundRect(this.x, this.y + depth, this.width, this.height, 7);
    ctx.fill();

    // Draw the top of the platform (lighter part)
    ctx.fillStyle = platformColors[this.type]; // Original color for the top
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 7);
    ctx.fill();
    //
    ctx.beginPath();
    ctx.fillStyle = platformColors[this.type];
    ctx.roundRect(this.x, this.y, this.width, this.height, 7);
    ctx.fill();
  }
}
