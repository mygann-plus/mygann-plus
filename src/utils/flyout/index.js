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

export default class Flyout {

  constructor(innerElem, opts) {
    const defaultOpts = {
      autoHide: true,
      onHide: () => {},
      direction: Flyout.directions.UP,
    };

    this.opts = { ...defaultOpts, ...opts };

    this.innerElem = innerElem;
    this._generateOuterElem();
  }

  showAtElem(targetElem, parentElem = targetElem.parentNode) {
    const { bottom, left, width } = targetElem.getBoundingClientRect();
    if (this.opts.direction === Flyout.directions.UP) {
      this.showAt(left + (width / 2), bottom, parentElem);
    } else if (this.opts.direction === Flyout.directions.LEFT) {
      this.showAt(width, bottom, parentElem);
    }
  }

  showAt(x, y, parentElem = document.body) {
    this._show(parentElem);
    this._position(x, y);
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

  _generateOuterElem() {
    const directionClassName = this._getDirectionClassName();
    this.arrowElem = <div className={classNames('arrow', selectors.arrow)}></div>;
    this.outerElem = (
      <div
        className={classNames('popover fade bottom', selectors.flyout, directionClassName)}
        role="tooltip"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => this._onKeyDown(e)}
        tabIndex={-1}
      >
        { this.arrowElem }
        <div className="popover-content">
          { this.innerElem }
        </div>
      </div>
    );
  }

  _getDirectionClassName() {
    switch (this.opts.direction) {
      case Flyout.directions.UP: return selectors.direction.up;
      case Flyout.directions.LEFT: return selectors.direction.left;
      default: return selectors.direction.up;
    }
  }

  _show(parentElem) {
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

  _position(x, y) {
    const { offsetParent } = this.outerElem;
    const { top, left } = offsetParent.getBoundingClientRect();
    const width = this.outerElem.clientWidth;
    const height = this.outerElem.clientHeight;
    if (this.opts.direction === Flyout.directions.UP) {
      this.outerElem.style.left = `${x - left}px`;
      this.outerElem.style.top = `${y - top}px`;
    } else if (this.opts.direction === Flyout.directions.LEFT) {
      const arrowWidth = 30;
      this.outerElem.style.left = `${x + (width / 2) + arrowWidth}px`;
      this.outerElem.style.top = `${y - height}px`;
      this.arrowElem.style.top = `${(height / 2) - (this.arrowElem.getBoundingClientRect().height / 4)}px`;
    }
  }

  _onKeyDown(e) {
    if (this.opts.autoHide && e.key === 'Escape') {
      this.hide();
    }
  }

}

Flyout.directions = {
  UP: Symbol('up'),
  LEFT: Symbol('left'),
};

insertCss(style.toString());
