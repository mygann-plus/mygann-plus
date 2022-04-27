import classNames from 'classnames';

import { Removable } from '~/core/module-loader';

import { createElement, insertCss, addEventListener } from '../dom';

import style from './style.css';

const selectors = {
  modalWrap: style.locals['modal-wrap'],
  modalFooterRight: style.locals['modal-footer-right'],
};

enum ButtonType {
  BUTTON = 'BUTTON',
  LINK = 'LINK',
}

const defaultButtonConfig = {
  type: ButtonType.BUTTON,
  primary: false,
  onClick() {},
};

interface DialogButton {
  name: string;
  type?: ButtonType;
  primary?: boolean;
  onClick?: () => boolean | void;
}

interface DialogConfig {
  leftButtons?: DialogButton[];
  rightButtons?: DialogButton[];
  onClose?: () => void;
  backdrop?: boolean;
}

export default class Dialog {

  static ButtonType = ButtonType;

  static buttons = {
    OK: {
      name: 'Okay',
      primary: true,
    },
    CANCEL: {
      name: 'Cancel',
      type: Dialog.ButtonType.LINK,
    },
    CLOSE: {
      name: 'Close',
      primary: true,
    },
  };

  private outerElem: HTMLElement;
  private innerElem: HTMLElement;
  private backdropElem: HTMLElement;
  private resizeListener: Removable;

  private leftButtons: HTMLButtonElement[];
  private rightButtons: HTMLButtonElement[];
  private title: string;
  private opts: DialogConfig;

  constructor(
    title: string,
    innerElem: HTMLElement | ((dialog: Dialog) => HTMLElement),
    opts: DialogConfig = {},
  ) {

    const defaultOpts: DialogConfig = {
      leftButtons: [Dialog.buttons.OK],
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

    this.generateOuterElem();
    this.insertInnerElement();
  }

  open() {
    document.body.appendChild(this.outerElem);
    if (this.opts.backdrop) {
      document.body.appendChild(this.backdropElem);
    }
    this.outerElem.focus();
    this.resizeDialog();
    this.resizeListener = addEventListener(window, 'resize', () => this.resizeDialog());
  }

  close() {
    this.resizeListener.remove();
    if (this.opts.backdrop) {
      this.backdropElem.remove();
    }
    this.outerElem.remove();
    this.opts.onClose();
  }

  getBody() {
    return this.innerElem;
  }

  rename(newTitle: string) {
    const title = this.outerElem.querySelector('h1.bb-dialog-header');
    title.textContent = newTitle;
  }

  getLeftButton(index: number) {
    return this.leftButtons[index];
  }

  getRightButton(index: number) {
    return this.rightButtons[index];
  }

  private constructButton(buttonConfig: DialogButton) {
    buttonConfig = { ...defaultButtonConfig, ...buttonConfig };

    const handleClick = (e: Event) => {
      e.preventDefault();
      if (buttonConfig.onClick() !== false) {
        this.close();
      }
    };

    const button = (
      <button className="btn" onClick={(e: any) => handleClick(e)}>
        {buttonConfig.name}
      </button>
    );

    if (buttonConfig.type === ButtonType.BUTTON) {
      button.classList.add('btn-default');
      if (buttonConfig.primary) {
        button.classList.add('btn-primary');
      }
    } else {
      button.classList.add('btn-link');
    }

    return button as HTMLButtonElement;
  }

  private generateOuterElem() {
    this.leftButtons = this.opts.leftButtons.map(btn => this.constructButton(btn));
    this.rightButtons = this.opts.rightButtons.map(btn => this.constructButton(btn));

    this.outerElem = (
      <div
        id="site-modal"
        tabIndex={-1}
        className={ classNames('modal bb-modal in', selectors.modalWrap) }
        onKeyDown={ (e: any) => this.onKeyDown(e) }
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

  private insertInnerElement() {
    this.outerElem.querySelector('.modal-body').appendChild(this.innerElem);
  }

  private onKeyDown({ key }: KeyboardEvent) {
    if (key === 'Escape') {
      this.close();
    }
  }

  private resizeDialog() {
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
    const modalBody = this.outerElem.querySelector('.modal-body') as HTMLElement;
    modalBody.style.maxHeight = `${bodyHeight}px`;

  }

}


insertCss(style.toString());
