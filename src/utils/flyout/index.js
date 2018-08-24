import classNames from 'classnames';

import { createElement, insertCss } from '~/utils/dom';

import style from './style.css';

const selectors = {
  flyout: style.locals.flyout,
  arrow: style.locals.arrow,
};

export default class Flyout {

  constructor(innerElem, opts) {
    const defaultOpts = {
      autoHide: true,
      onHide: () => {},
    };

    this.opts = { ...defaultOpts, ...opts };

    this.innerElem = innerElem;
    this._generateOuterElem();
  }

  showAtElem(targetElem, parentElem = targetElem.parentNode) {
    const { bottom, left, width } = targetElem.getBoundingClientRect();
    this.showAt(left + (width / 2), bottom, parentElem);
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
    this.outerElem = (
      <div
        className={classNames('popover fade bottom', selectors.flyout)}
        role="tooltip"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => this._onKeyDown(e)}
        tabIndex={-1}
      >
        <div className={classNames('arrow', selectors.arrow)}></div>
        <div className="popover-content">
          { this.innerElem }
        </div>
      </div>
    );
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
    this.outerElem.style.left = `${x - left}px`;
    this.outerElem.style.top = `${y - top}px`;
  }

  _onKeyDown(e) {
    if (this.opts.autoHide && e.key === 'Escape') {
      this.hide();
    }
  }

}

insertCss(style.toString());
