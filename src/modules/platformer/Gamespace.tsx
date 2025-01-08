export type GameSpace = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  start: () => void;
  update: () => void;
  clear: () => void;
};
