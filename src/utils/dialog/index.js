import { createElementFromHTML, insertCss } from '../dom';

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
    const html = `<button>${buttonConfig.name}</button>`;
    const button = createElementFromHTML(html);

    button.classList.add('btn');
    if (buttonConfig.type === buttonTypes.BUTTON) {
      button.classList.add('btn-default');
      if (buttonConfig.primary) {
        button.classList.add('btn-primary');
      }
    } else {
      button.classList.add('btn-link');
    }

    button.addEventListener('click', e => {
      e.preventDefault();
      if (buttonConfig.onClick() !== false) {
        this.close();
      }
    });

    return button;
  }

  _generateOuterElem() {
    const html = `
      <div 
        id="site-modal" 
        tabindex="-1" 
        class="modal bb-modal in ${selectors.modalWrap}"
      >
        <div>
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <a class="close fa fa-times"></a>
                <h1 class="bb-dialog-header">${this.title}</h1>
              </div>
              <div class="modal-body ${selectors.modalBody}"></div>
              <div class="modal-footer">
                <div class="${selectors.modalFooterRight}">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const backdrop = '<div class="modal-backdrop in"></div>';
    this.outerElem = createElementFromHTML(html);
    this.backdropElem = createElementFromHTML(backdrop);

    const footer = this.outerElem.querySelector('.modal-footer');
    const rightFooter = this.outerElem.querySelector(`.${selectors.modalFooterRight}`);

    this.opts.leftButtons.forEach(btn => footer.appendChild(this._constructButton(btn)));
    this.opts.rightButtons.forEach(btn => rightFooter.appendChild(this._constructButton(btn)));

    this._addListeners();
  }

  _insertInnerElement() {
    this.outerElem.querySelector('.modal-body').appendChild(this.innerElem);
  }

  _addListeners() {
    this.outerElem.querySelector('.close').addEventListener('click', () => this.close());
    this.outerElem.addEventListener('keydown', ({ key }) => {
      if (key === 'Escape') {
        this.close();
      }
    });
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
