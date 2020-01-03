import classNames from 'classnames';

import { createElement, insertCss, addEventListener } from '~/utils/dom';

import style from './style.css';

const selectors = {
  modalWrap: style.locals['modal-wrap'],
  modalFooterRight: style.locals['modal-footer-right'],
};

const buttonTypes = {
  BUTTON: 'BUTTON',
  LINK: 'LINK',
};

const defaultButtonConfig = {
  type: buttonTypes.BUTTON,
  primary: false,
  onClick() {},
};

export default class Dialog {

  constructor(title, innerElem, opts = {}) {

    const defaultOpts = {
      leftButtons: [Dialog.buttons.OKAY],
      rightButtons: [],
      onClose() {},
      backdrop: true,
    };

    if (typeof innerElem === 'function') {
      this.innerElem = innerElem(this);
    } else {
      this.innerElem = innerElem;
    }

    this.title = title;
    this.opts = Object.assign(defaultOpts, opts);

    this._generateOuterElem();
    this._insertInnerElement();
  }

  open() {
    document.body.appendChild(this.outerElem);
    if (this.opts.backdrop) {
      document.body.appendChild(this.backdropElem);
    }
    this.outerElem.focus();
    this._resizeDialog();
    this._resizeListener = addEventListener(window, 'resize', () => this._resizeDialog());
  }

  close() {
    this._resizeListener.remove();
    if (this.opts.backdrop) {
      this.backdropElem.remove();
    }
    this.outerElem.remove();
    this.opts.onClose();
  }

  getBody() {
    return this.innerElem;
  }

  getLeftButton(index) {
    return this.leftButtons[index];
  }

  getRightButton(index) {
    return this.rightButtons[index];
  }

  _constructButton(buttonConfig) {
    buttonConfig = Object.assign({}, defaultButtonConfig, buttonConfig);

    const handleClick = e => {
      e.preventDefault();
      if (buttonConfig.onClick() !== false) {
        this.close();
      }
    };

    const button = <button className="btn" onClick={ handleClick }>{buttonConfig.name}</button>;

    if (buttonConfig.type === buttonTypes.BUTTON) {
      button.classList.add('btn-default');
      if (buttonConfig.primary) {
        button.classList.add('btn-primary');
      }
    } else {
      button.classList.add('btn-link');
    }

    return button;
  }

  _generateOuterElem() {
    this.leftButtons = this.opts.leftButtons.map(btn => this._constructButton(btn));
    this.rightButtons = this.opts.rightButtons.map(btn => this._constructButton(btn));

    this.outerElem = (
      <div
        id="site-modal"
        tabIndex={-1}
        className={ classNames('modal bb-modal in', selectors.modalWrap) }
        onKeyDown={ e => this._onKeyDown(e) }
      >
        <div>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <a className="close fa fa-times" onClick={ () => this.close() }></a>
                <h1 className="bb-dialog-header">{this.title}</h1>
              </div>
              <div className="modal-body"></div>

              <div className="modal-footer">
                { this.leftButtons }
                <div className={selectors.modalFooterRight}>
                  { this.rightButtons }
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
    this.backdropElem = <div className="modal-backdrop in"></div>;
  }

  _insertInnerElement() {
    this.outerElem.querySelector('.modal-body').appendChild(this.innerElem);
  }

  _onKeyDown({ key }) {
    if (key === 'Escape') {
      this.close();
    }
  }

  _resizeDialog() {
    const viewportHeight = window.innerHeight;

    const modalDialog = this.outerElem.querySelector('.modal-dialog');
    const modalDialogComputedStyle = window.getComputedStyle(modalDialog);
    const marginTop = parseInt(modalDialogComputedStyle.marginTop, 10);
    const marginBottom = parseInt(modalDialogComputedStyle.marginBottom, 10);

    const header = this.outerElem.querySelector('.modal-header');
    const footer = this.outerElem.querySelector('.modal-footer');
    const headerHeight = header.getBoundingClientRect().height;
    const footerHeight = footer.getBoundingClientRect().height;

    const bodyHeight = viewportHeight - marginTop - marginBottom - headerHeight - footerHeight;
    this.outerElem.querySelector('.modal-body').style.maxHeight = `${bodyHeight}px`;

  }

}

Dialog.buttons = {
  OK: {
    name: 'Okay',
    primary: true,
  },
  CANCEL: {
    name: 'Cancel',
    type: buttonTypes.LINK,
  },
  CLOSE: {
    name: 'Close',
    primary: true,
  },
};

Dialog.buttonTypes = buttonTypes;

insertCss(style.toString());
