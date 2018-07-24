import { createElementFromHTML, removeElement } from './dom';

// TODO: more configurable buttons

const noop = () => {};

export default class Dialog {

  constructor(title, innerElem, opts = {}) {

    const defaultOpts = {
      onSave: noop,
      onClose: noop,
      buttons: [Dialog.buttons.SAVE, Dialog.buttons.CANCEL],
      rightButton: '',
      onRight: noop,
      backdrop: false,
    };

    this.id = Math.floor(Math.random() * 1000000); // random 5-digit number
    this.title = title;
    this.innerElem = innerElem;
    this.opts = Object.assign(defaultOpts, opts);

    this._generateOuterElem();
  }

  open() {
    document.body.appendChild(this.outerElem);
    if (this.opts.backdrop) {
      document.body.appendChild(this.backdropElem);
    }
    this._insertInnerElement();
    this._addListeners();
  }
  close() {
    const dialog = document.querySelector(`div[data-gocp_dialog_id="${this.id}"]`);
    if (this.opts.backdrop) {
      const backdrop = document.querySelector(`div[data-gocp_dialog_backdrop-id="${this.id}"]`);
      removeElement(backdrop);
    }
    removeElement(dialog);
    this.opts.onClose();
  }

  _generateOuterElem() {
    const html = `
      <div 
        id="site-modal" 
        data-gocp_dialog_id="${this.id}" 
        tabindex="-1" 
        class="modal bb-modal in" 
        style="display: block; padding-right: 16px;"
      >
        <div>
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <a class="close" id="gocp_dialog_close">×</a>
                <h1 class="bb-dialog-header">${this.title}</h1>
              </div>
              <div class="modal-body" style="max-height: 465px; overflow-y: auto"></div>
              <div class="modal-footer">
                ${this.opts.buttons.join('')}
                <div id="gocp_modal-right" style="float: right; margin-top: 5px;">
                  ${this.opts.rightButton}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const backdrop = `
      <div 
        class="modal-backdrop in" 
        id="gocp_dialog_backdrop" 
        data-gocp_dialog_backdrop-id="${this.id}"
      ></div>
    `;
    this.outerElem = createElementFromHTML(html);
    this.backdropElem = createElementFromHTML(backdrop);
  }

  _insertInnerElement() {
    const dialog = document.querySelector(`div[data-gocp_dialog_id="${this.id}"]`);
    const body = dialog.children[0].children[0].children[0].children[1];
    body.appendChild(this.innerElem);
  }

  _addListeners() {

    const { buttons } = Dialog;

    document.getElementById('gocp_dialog_close').addEventListener('click', () => this.close());
    if (this.opts.buttons.includes(buttons.CANCEL) || this.opts.buttons.includes(buttons.OKAY)) {
      document.getElementById('gocp_dialog_cancel').addEventListener('click', e => {
        e.preventDefault();
        this.close();
      });
    }
    if (this.opts.buttons.includes(buttons.SAVE)) {
      document.getElementById('gocp_dialog_save').addEventListener('click', e => {
        e.preventDefault();
        if (this.opts.onSave() !== false) {
          this.close();
        }
      });
    }

    document.getElementById('gocp_modal-right').addEventListener('click', e => {
      e.preventDefault();
      this.opts.onRight();
    });
  }

}

Dialog.buttons = {
  SAVE: '<a href="#" class="btn btn-default btn-primary" id="gocp_dialog_save">Save</a>',
  CANCEL: '<a href="#" class="btn btn-default" id="gocp_dialog_cancel">Cancel</a>',
  OKAY: '<a href="#" class="btn btn-default btn-primary" id="gocp_dialog_cancel">Okay</a>',
};

