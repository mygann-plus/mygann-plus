import classNames from 'classnames';

import { createElement, insertCss } from '~/utils/dom';

import style from './style.css';

const selectors = {
  flyout: style.locals.flyout,
  arrow: style.locals.arrow,
  direction: {
    up: style.locals['direction-up'],
    left: style.locals['direction-left'],
  },
};

enum Direction {
  UP = 'UP',
  LEFT = 'LEFT',
}

interface FlyoutConfig {
  autoHide?: boolean;
  onHide?: () => void;
  direction?: Direction;
}

export default class Flyout {

  static Direction = Direction;

  private opts: FlyoutConfig;
  private innerElem: HTMLElement;
  private outerElem: HTMLElement;
  private arrowElem: HTMLElement;

  constructor(innerElem: HTMLElement, opts?: FlyoutConfig) {
    const defaultOpts = {
      autoHide: true,
      onHide: () => {},
      direction: Flyout.Direction.UP,
    };

    this.opts = { ...defaultOpts, ...opts };

    this.innerElem = innerElem;
    this.generateOuterElem();
  }

  showAtElem(
    targetElem: HTMLElement,
    parentElem: HTMLElement = targetElem.parentNode as HTMLElement,
  ) {
    const { bottom, left, width } = targetElem.getBoundingClientRect();
    if (this.opts.direction === Flyout.Direction.UP) {
      this.showAt(left + (width / 2), bottom, parentElem);
    } else if (this.opts.direction === Flyout.Direction.LEFT) {
      this.showAt(width, bottom, parentElem);
    }
  }

  showAt(x: number, y: number, parentElem = document.body) {
    this.show(parentElem);
    this.position(x, y);
  }

  hide() {
    this.opts.onHide();
    this.outerElem.classList.remove('in');
    this.outerElem.addEventListener('transitionend', () => {
      this.outerElem.remove();
    }, { once: true });
  }

  getBody() {
    return this.innerElem;
  }

  private generateOuterElem() {
    const directionClassName = this.getDirectionClassName();
    this.arrowElem = <div className={classNames('arrow', selectors.arrow)}></div>;
    this.outerElem = (
      <div
        className={classNames('popover fade bottom', selectors.flyout, directionClassName)}
        role="tooltip"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onKeyDown={(e: any) => this.onKeyDown(e)}
        tabIndex={-1}
      >
        { this.arrowElem }
        <div className="popover-content">
          { this.innerElem }
        </div>
      </div>
    );
  }

  private getDirectionClassName() {
    switch (this.opts.direction) {
      case Flyout.Direction.UP: return selectors.direction.up;
      case Flyout.Direction.LEFT: return selectors.direction.left;
      default: return selectors.direction.up;
    }
  }

  private show(parentElem: HTMLElement) {
    parentElem.appendChild(this.outerElem);
    this.outerElem.focus();
    setTimeout(() => {
      this.outerElem.classList.add('in');
    }, 0);

    if (this.opts.autoHide) {
      document.addEventListener('mousedown', () => this.hide(), {
        once: true,
      });
    }
  }

  private position(x: number, y: number) {
    const { offsetParent } = this.outerElem;
    const { top, left } = offsetParent.getBoundingClientRect();
    const width = this.outerElem.clientWidth;
    const height = this.outerElem.clientHeight;
    if (this.opts.direction === Flyout.Direction.UP) {
      this.outerElem.style.left = `${x - left}px`;
      this.outerElem.style.top = `${y - top}px`;
    } else if (this.opts.direction === Flyout.Direction.LEFT) {
      const arrowWidth = 30;
      this.outerElem.style.left = `${x + (width / 2) + arrowWidth}px`;
      this.outerElem.style.top = `${y - height}px`;
      this.arrowElem.style.top = `${(height / 2) - (this.arrowElem.getBoundingClientRect().height / 4)}px`;
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.opts.autoHide && e.key === 'Escape') {
      this.hide();
    }
  }

}

insertCss(style.toString());
