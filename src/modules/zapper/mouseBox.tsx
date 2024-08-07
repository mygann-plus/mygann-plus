import { ClickAction, SaveAction } from './types';
import { getCssSelector } from './utils';

export default class MouseBox {
  private boxStatus: boolean;
  private clickAction: ClickAction;
  private saveAction: SaveAction;
  private overlay: HTMLElement | null = null;
  private currentTarget: HTMLElement | null = null;

  constructor(action: ClickAction) {
    this.clickAction = action;
    this.boxStatus = false;
  }

  private handleSubnavtop() {
    const elements = document.getElementsByClassName('subnavtop');
    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i] as HTMLElement;
      elm.remove();
      i--;
    }
  }

  private handleMouseOver = (event: MouseEvent) => {
    event.stopPropagation();
    this.handleSubnavtop(); // Use 'this' to refer to the class method
    const target = event.target as HTMLElement;
    if (target && target !== this.overlay) {
      const rect = target.getBoundingClientRect();
      if (this.overlay) {
        this.overlay.style.width = `${rect.width}px`;
        this.overlay.style.height = `${rect.height}px`;
        this.overlay.style.left = `${rect.left + window.scrollX}px`;
        this.overlay.style.top = `${rect.top + window.scrollY}px`;
        this.overlay.style.display = 'block';
      }
    }
  };

  private handleMouseOut = (event: MouseEvent) => {
    event.stopPropagation();
    this.handleSubnavtop(); // Use 'this' to refer to the class method
    const target = event.target as HTMLElement;
    if (target && target !== this.overlay && target !== this.currentTarget) {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
    }
  };

  private handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.handleSubnavtop(); // Use 'this' to refer to the class method
    const target = event.target as HTMLElement;
    if (target && target !== this.overlay) {
      if (target.dataset.clicked === 'true') {
        this.clickAction(true, getCssSelector(target));
        target.style.removeProperty('background');
        target.dataset.clicked = 'false';
      } else {
        this.clickAction(false, getCssSelector(target));
        target.style.setProperty(
          'background',
          'rgba(255, 0, 0, 0.7)',
          'important',
        );
        target.dataset.clicked = 'true';
      }
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      this.currentTarget = target; // Use 'this' to refer to the class property
    }
  };

  mouseBoxOn(): void {
    this.handleSubnavtop();

    // Create overlay if it doesn't exist
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.style.position = 'absolute';
      this.overlay.style.pointerEvents = 'none';
      this.overlay.style.border = '2px solid rgba(255, 0, 0, 0.5)';
      this.overlay.style.background = 'rgba(255, 0, 0, 0.2)';
      this.overlay.style.zIndex = '9999';
      this.overlay.style.display = 'none';
      document.body.appendChild(this.overlay);
    }

    // Mouseover event
    document.addEventListener('mouseover', this.handleMouseOver);

    // Mouseout event
    document.addEventListener('mouseout', this.handleMouseOut);

    // Click event
    document.addEventListener('click', this.handleClick);
  }

  mouseBoxOff() {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
    }

    // Remove event listeners
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener('mouseout', this.handleMouseOut);
    document.removeEventListener('click', this.handleClick);
  }
}
