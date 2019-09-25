import classNames from 'classnames';

import { createElement, constructButton } from './dom';

export default class DropdownMenu {

  /**
   * @param {Object[]} items
   * @param {string} items[].title
   * @param {function} items[].onclick
   */
  constructor(items, opts) {
    const defaultOpts = {
      buttonClassname: '',
      wrapClassname: '',
      buttonIconClassname: 'fa fa-ellipsis-h',
      buttonText: '',
    };

    this.items = items;
    this.opts = Object.assign({}, defaultOpts, opts);
    this.dropdownElement = this._generateDropdownHtml();
    this.dropdownWrap = this._generateWrapHtml();
    this._addListeners();
  }

  getDropdownWrap() {
    return this.dropdownWrap;
  }

  getDropdownElement() {
    return this.dropdownElement;
  }

  getDropdownButton() {
    return this.dropdownWrap.querySelector('button');
  }

  /**
   *
   * @param {Object} item
   * @param {string} item.title
   * @param {function} item.onclick
   */
  addItem(item) {
    this.dropdownElement.appendChild(this._createItemElem(item));
  }

  clearItems() {
    this.dropdownElement.innerHTML = '';
  }

  _generateWrapHtml() {
    const button = constructButton(
      this.opts.buttonText, '',
      this.opts.buttonIconClassname, () => this._toggleDropdown(), this.opts.buttonClassname,
    );
    return (
      <div
        className={classNames('btn-group', this.opts.wrapClassname)}
        onBlur={ () => this._hideDropdown() }
      >
        { button }
        { this.dropdownElement }
      </div>
    );
  }

  _createItemElem(item) {
    if (item === null) {
      return <li className="divider" />;
    }
    const itemStyles = { textDecoration: 'none' };
    return (
      <li>
        <a
          href="#"
          style={ itemStyles }
          onClick={e => this._handleItemClick(e, item.onclick) }
        >
          { item.title }
        </a>
      </li>
    );
  }

  _generateDropdownHtml() {
    // arrow function is needed to preserve this
    const itemsList = this.items.map(elem => this._createItemElem(elem));
    return (
      <ul className="dropdown-menu" role="menu">
        { itemsList }
      </ul>
    );
  }

  _hideDropdown() { this.dropdownElement.style.display = 'none'; }

  _showDropdown() { this.dropdownElement.style.display = 'block'; }

  _toggleDropdown() {
    const wasShown = this.dropdownElement.style.display === 'block';
    if (wasShown) {
      this._hideDropdown();
    } else {
      this._showDropdown();
    }
  }

  _addListeners() {
    document.body.addEventListener('click', e => {
      if (e.target === this.dropdownWrap || this.dropdownWrap.contains(e.target)) {
        return;
      }
      this._hideDropdown();
    });
  }

  _handleItemClick(e, callback) {
    e.preventDefault();
    callback();
    this._hideDropdown();
  }

}
