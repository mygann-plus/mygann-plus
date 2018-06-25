import { createElementFromHTML } from './dom';

// TODO: custom buttons

const noop = () => {};

export default class Dialog {

  constructor(title, innerElem, onSave = noop, onClose = noop) {
    this.id = Math.floor(Math.random() * 1000000); // random 5-digit number
    this.title = title;
    this.innerElem = innerElem;
    this.onSave = onSave;
    this.onClose = onClose;

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
              <div class="modal-body"></div>
              <div class="modal-footer">
                <a href="#" class="btn btn-default btn-primary" id="gocp_dialog_save">Save</a>
                <a href="#" class="btn btn-default" id="gocp_dialog_cancel">Cancel</a>
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
    document.getElementById('gocp_dialog_close').addEventListener('click', () => this.close());
    document.getElementById('gocp_dialog_cancel').addEventListener('click', e => {
      e.preventDefault();
      this.close();
    });
    document.getElementById('gocp_dialog_save').addEventListener('click', e => {
      e.preventDefault();
      if (this.onSave() !== false) {
        this.close();
      }
    });
    return this;
  }

}
