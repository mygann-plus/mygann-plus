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

  showAtElem(targetElem) {
    const { bottom, left, width } = targetElem.getBoundingClientRect();
    const offsetBottom = window.scrollY + bottom;
    const offsetLeft = window.scrollX + left;
    this.showAt(offsetLeft + (width / 2), offsetBottom);
  }

  showAt(x, y) {
    this.outerElem.style.left = `${x}px`;
    this.outerElem.style.top = `${y}px`;
    document.body.appendChild(this.outerElem);

    setTimeout(() => {
      this.outerElem.classList.add('in');
    }, 0);

    if (this.opts.autoHide) {
      document.addEventListener('mousedown', () => this.hide(), {
        once: true,
      });
    }
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
      >
        <div className={classNames('arrow', selectors.arrow)}></div>
        <div className="popover-content">
          { this.innerElem }
        </div>
      </div>
    );
  }

}

insertCss(style.toString());
