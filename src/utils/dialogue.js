import { createElementFromHTML } from './dom';

// TODO: more configurable buttons
// TODO: optional backdrop

const noop = () => {};

export default class Dialog {

  constructor(title, innerElem, opts = {}) {

    const defaultOpts = {
      onSave: noop,
      onClose: noop,
      buttons: [Dialog.buttons.SAVE, Dialog.buttons.CANCEL],
    };
    opts = Object.assign(defaultOpts, opts);

    this.id = Math.floor(Math.random() * 1000000); // random 5-digit number
    this.title = title;
    this.innerElem = innerElem;
    this.onSave = opts.onSave;
    this.onClose = opts.onClose;

    this.buttons = opts.buttons;

    this._generateOuterElem();
  }

  open() {
    document.body.appendChild(this.outerElem);
    this._insertInnerElement();
    this._addListeners();
  }
  close() {
    const dialog = document.querySelector(`div[data-gocp_dialog_id="${this.id}"]`);
    dialog.parentNode.removeChild(dialog);
    this.onClose();
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
                ${this.buttons.join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.outerElem = createElementFromHTML(html);
  }

  _insertInnerElement() {
    const dialog = document.querySelector(`div[data-gocp_dialog_id="${this.id}"]`);
    const body = dialog.children[0].children[0].children[0].children[1];
    body.appendChild(this.innerElem);
  }

  _addListeners() {

    const { buttons } = Dialog;

    document.getElementById('gocp_dialog_close').addEventListener('click', () => this.close());
    if (this.buttons.includes(buttons.CANCEL) || this.buttons.includes(buttons.OKAY)) {
      document.getElementById('gocp_dialog_cancel').addEventListener('click', e => {
        e.preventDefault();
        this.close();
      });
    }
    if (this.buttons.includes(buttons.SAVE)) {
      document.getElementById('gocp_dialog_save').addEventListener('click', e => {
        e.preventDefault();
        if (this.onSave() !== false) {
          this.close();
        }
      });
    }
  }

}

Dialog.buttons = {
  SAVE: '<a href="#" class="btn btn-default btn-primary" id="gocp_dialog_save">Save</a>',
  CANCEL: '<a href="#" class="btn btn-default" id="gocp_dialog_cancel">Cancel</a>',
  OKAY: '<a href="#" class="btn btn-default btn-primary" id="gocp_dialog_cancel">Okay</a>',
};

