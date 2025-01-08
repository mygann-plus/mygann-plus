import Controller from './Controller';
import { GameSpace } from './Gamespace';
import Platform, { PlatformType } from './Platform';
import Player from './Player';

let viewWidth = Math.max(
  document.documentElement.clientWidth,
  window.innerWidth || 0,
);
let viewHeight = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0,
);
// viewHeight = 2000;
let onPlatform = false;
let touchingLeft = false;
let touchingRight = false;
let player: Player;
let controller: Controller;
let interval: ReturnType<typeof setInterval>;
let previousYLoc = window.pageYOffset;
let canScroll = false;
let easeSpeed = 10; // Larger values = slower scrolling
let leftPress = false;
let rightPress = false;
let maxSpeed = 8.5;
let accelerationRate = 1.8;
let decelerationRate = 1.2;
let currentSpeed = 0;
let restrictKeys = false;
let xDown: number = null;
let yDown:number = null;

const deadZoneX: number = 60;
const deadZoneY:number = 35;

let gameSpace: GameSpace = {
  canvas: document.createElement('canvas'),
  context: null, // Initialize as null because it will be set later
  start() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.zIndex = '500';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';

    this.canvas.width = document.body.scrollWidth;
    this.canvas.height = document.body.scrollHeight;
    this.canvas.height = 2000;
    // this.canvas.style.backgroundColor = "red"

    // Ensure context is initialized
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    this.context = ctx;

    this.context.fillStyle = 'rgba(0,0,255,0.5)';
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    this.canvas.setAttribute('id', 'extensionGameCanvas');
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  },

  update() {
    const canvas = document.getElementById(
      'extensionGameCanvas',
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      console.warn('Canvas not found');
    }

    // Uncomment if you need to dynamically adjust the canvas size
    this.canvas.width = document.body.scrollWidth;
    this.canvas.height = document.body.scrollHeight;
  },

  clear() {
    if (!this.context) {
      throw new Error('Canvas context is not initialized. Call start() first.');
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'rgba(0,0,0,0.0)';
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  },
};
function isFixed(element: HTMLElement) {
  let position = '';
  while (element) {
    const style = window.getComputedStyle(element);
    position = style.position;
    if (position === 'fixed') {
      if (element.id !== 'site-modal') {
        element.style.zIndex = '600';
        if (element.id === 'site-nav-container') {
          element.style.zIndex = '700'; // top header contains drop down menus. this makes sure it's above the rest.
        }
      }
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

function easeView() {
  if (player.y - window.pageYOffset - viewHeight / 2 > 0) {
    return (
      window.pageYOffset
      + (player.y - window.pageYOffset - viewHeight / 2) / easeSpeed
    );
  } else if (player.y - window.pageYOffset - viewHeight / 2 < 0) {
    return (
      window.pageYOffset
      + (player.y - window.pageYOffset - viewHeight / 2) / easeSpeed
    );
  } else {
    canScroll = true;
  }
  return window.pageYOffset;
}

function smoothScroll() {
  let s = easeView();

  if (
    (currentSpeed !== 0 || player.velY !== 0 || s !== window.pageYOffset)
    && !canScroll
  ) {
    window.scrollTo(player.x - viewWidth / 2, s);
  }
}

let platforms: Platform[] = [];
function detectPlatforms() {
  let links = document.querySelectorAll('a, h2, p, button, .btn, .badge');
  let testingList = Array.prototype.slice.call(links);
  platforms = [];

  testingList.forEach((element: HTMLElement) => {
    let rect = element.getBoundingClientRect();
    let left = rect.left + window.pageXOffset;
    let top = rect.top + window.pageYOffset;

    if (element.offsetParent != null && !isFixed(element)) {
      platforms.push(
        new Platform(
          rect.width,
          rect.height,
          'rgba(0,0,255,0.2)',
          left,
          top,
          gameSpace,
          element.tagName === 'BUTTON' || element.classList.contains('btn') ? PlatformType.Jump : PlatformType.Normal,
        ),
      );
    }
  });
}
function accelerate() {
  if (leftPress && !rightPress) {
    if (!touchingLeft) {
      if (currentSpeed > -maxSpeed) {
        currentSpeed -= accelerationRate;
      }
    }
  } else if (rightPress && !leftPress) {
    if (!touchingRight) {
      if (currentSpeed < maxSpeed) {
        currentSpeed += accelerationRate;
      }
    }
  } else if (Math.abs(currentSpeed) > 1) {
    currentSpeed -= (Math.abs(currentSpeed) / currentSpeed) * decelerationRate;
  } else {
    currentSpeed = 0;
  }

  player.velX = currentSpeed;
}

function boost() {
  player.falling = true;
  player.y -= 1;
  player.velY = -20;
  canScroll = false;
}
//
// function boostRight() {
//   player.x += 1;
//   player.velX = 10;
//   canScroll = false;
// }

function updatePlatforms() {
  let shouldFall = true;
  let tempTouchingLeft = false;
  let tempTouchingRight = false;

  platforms.forEach((p) => {
    p.update();
    if (player.y < p.y + p.height && player.y + player.height > p.y) {
      if (player.x < p.x + p.width + 10 && player.velX <= 0) {
        if (
          p.x + p.width <= (player.x)
        ) {
          player.velX = 0;
          player.x = p.x + p.width;
          touchingLeft = true;
        }
      }
    }

    if (player.y < p.y + p.height && player.y + player.height > p.y) {
      if (player.x + player.width + 10 > p.x && player.velX >= 0) {
        if (
          p.x >= (player.x + player.width)
        ) {
          player.velX = 0;
          player.x = p.x - player.width;
          tempTouchingRight = true;
        }
      }
    }

    if (player.x < p.x + p.width && player.x + player.width > p.x) {
      if (player.y + player.height < p.y + 10 && player.velY >= 0) {
        if (
          p.y - (player.height + player.y) >= 0
          && p.y - (player.height + player.y) < 1 + Math.abs(player.velY)
        ) {
          if (p.type === PlatformType.Jump) {
            boost();
          } else {
            player.velY = 0;
            player.y = p.y - player.height;
            onPlatform = true;
            shouldFall = false;
          }
        }
      } else {
        onPlatform = false;
      }
    }
  });

  onPlatform = !shouldFall;
  touchingLeft = tempTouchingLeft;
  touchingRight = tempTouchingRight;
}

function updateFrame() {
  if (window.pageYOffset === previousYLoc) {
    canScroll = true;
  }

  previousYLoc = window.pageYOffset;

  if (player.velY !== 0 || player.velX !== 0) {
    canScroll = false;
  }

  gameSpace.clear();
  gameSpace.update();
  updatePlatforms();
  detectPlatforms();
  controller.update();
  player.updatePos(viewWidth, onPlatform);
  player.update();
  smoothScroll();
  accelerate();
}

function disableArrowKeys(e: KeyboardEvent) {
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    if (restrictKeys) {
      e.preventDefault();
    }
  }
}
interface KeyMap {
  [keyCode: number]: boolean;
}
let map: KeyMap = {};
function jump() {
  if (!player.falling) {
    player.falling = true;
    player.y -= 1;
    player.velY -= 12;
    canScroll = false;
  }
}
function drop() {
  if (!player.falling) {
    player.y += 1;
  }
}

const handleKeyEvent = (e: KeyboardEvent): void => {
  map[e.keyCode] = e.type === 'keydown';

  console.log(e.keyCode);

  // Keydown for R. reloads platforms for testing
  if (map[82]) {
    detectPlatforms();
  }

  // Keydown Left & Right Arrows
  if (map[37]) {
    leftPress = true;
    canScroll = false;
  }
  if (map[39]) {
    rightPress = true;
    canScroll = false;
  }

  // Keyup Left & Right Arrows
  if (!map[37]) {
    leftPress = false;
  }

  if (!map[39]) {
    rightPress = false;
  }

  // Jump
  if (map[32] || map[38]) {
    jump();
  }

  // Drop through platform
  if (map[40]) drop();
};

// Separate event listener assignments to avoid chained assignments
document.addEventListener('keydown', handleKeyEvent);
document.addEventListener('keyup', handleKeyEvent);

function handleTouchStart(e: TouchEvent) {
  const firstTouch = e.targetTouches[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(e: TouchEvent) {
  if (!xDown || !yDown) return;
  e.preventDefault();

  let xUp = e.targetTouches[0].clientX;
  let yUp = e.targetTouches[0].clientY;
  let xDiff = xDown - xUp;
  let yDiff = yDown - yUp;

  if (xDiff > deadZoneX) {
    leftPress = true;
    rightPress = false;
  } else if (xDiff < -deadZoneX) {
    leftPress = false;
    rightPress = true;
  } else {
    leftPress = false;
    rightPress = false;
  }

  if (yDiff > deadZoneY) jump();
  else if (yDiff < -deadZoneY) drop();

  controller.x = xDown - deadZoneX;
  controller.y = window.pageYOffset + yDown;
  controller.setVisible(true);
}

// window.addEventListener("resize", gameSpace.update, false);
window.addEventListener('keydown', disableArrowKeys, false);

// Touch events
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.body.addEventListener('touchmove', handleTouchMove, {
  passive: false,
});
document.body.addEventListener('touchend', (e) => {
  if (e.targetTouches.length === 0) {
    rightPress = false;
    leftPress = false;
    controller.setVisible(false);
  }
  xDown = null;
  yDown = null;
});
export default function createCanvas() {
  if (document.getElementById('extensionGameCanvas') == null) {
    detectPlatforms();
    restrictKeys = true;
    player = new Player(30, 60, 'red', viewWidth / 2, window.pageYOffset, gameSpace);
    controller = new Controller(
      deadZoneX * 2,
      deadZoneY * 2,
      '#00000066',
      0,
      0,
      gameSpace,
    );
    gameSpace.start();
    interval = setInterval(updateFrame, 20);
  } else {
    let c = document.getElementById('extensionGameCanvas');
    c.parentNode.removeChild(c);
    restrictKeys = false;
    clearInterval(interval);
    player = null;
  }
}
