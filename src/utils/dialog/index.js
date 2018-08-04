import classNames from 'classnames';

import { createElement, insertCss } from '../dom';

import style from './style.css';

const selectors = {
  modalWrap: style.locals['modal-wrap'],
  modalBody: style.locals['custom-modal-body'],
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

    this.title = title;
    this.innerElem = innerElem;
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
  }
  close() {
    if (this.opts.backdrop) {
      this.backdropElem.remove();
    }
    this.outerElem.remove();
    this.opts.onClose();
  }
  getBody() {
    return this.innerElem;
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
    this.outerElem = (
      <div
        id="site-modal"
        tabIndex="-1"
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
              <div className={ classNames('modal-body', selectors.modalBody) }></div>

              <div className="modal-footer">
                { this.opts.leftButtons.map(btn => this._constructButton(btn)) }
                <div className={selectors.modalFooterRight}>
                  { this.opts.rightButtons.map(btn => this._constructButton(btn)) }
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
};

Dialog.buttonTypes = buttonTypes;

insertCss(style.toString());
