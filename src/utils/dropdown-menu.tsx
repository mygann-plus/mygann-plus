import classNames from 'classnames';

import { createElement, constructButton } from './dom';

interface DropdownItem {
  title: string;
  onclick: () => void;
  style?: React.CSSProperties;
}

interface DropdownConfig {
  buttonText?: string;
  buttonClassname?: string;
  wrapClassname?: string;
  buttonIconClassname?: string;
}

export default class DropdownMenu {

  private items: DropdownItem[];
  private opts: DropdownConfig;

  private dropdownElement: HTMLElement;
  private dropdownWrap: HTMLElement;

  constructor(items: DropdownItem[], opts?: DropdownConfig) {
    const defaultOpts = {
      buttonClassname: '',
      wrapClassname: '',
      buttonIconClassname: 'fa fa-ellipsis-h',
      buttonText: '',
    };

    this.items = items;
    this.opts = { ...defaultOpts, ...opts };
    this.dropdownElement = this.generateDropdownHtml();
    this.dropdownWrap = this.generateWrapHtml();
    this.addListeners();
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
  addItem(item: DropdownItem) {
    this.dropdownElement.appendChild(this.createItemElem(item));
  }

  clearItems() {
    this.dropdownElement.innerHTML = '';
  }

  private generateWrapHtml() {
    const button = constructButton({
      textContent: this.opts.buttonText,
      iClassName: this.opts.buttonIconClassname,
      className: this.opts.buttonClassname,
      onClick: () => this.toggleDropdown(),
    });
    return (
      <div
        className={classNames('btn-group', this.opts.wrapClassname)}
        onBlur={ () => this.hideDropdown() }
      >
        { button }
        { this.dropdownElement }
      </div>
    );
  }

  private createItemElem(item: DropdownItem) {
    if (item === null) {
      return <li className="divider" />;
    }
    const itemStyles = { textDecoration: 'none', ...item.style };
    return (
      <li>
        <a
          href="#"
          style={ itemStyles }
          onClick={(e: any) => this.handleItemClick(e, item.onclick) }
        >
          { item.title }
        </a>
      </li>
    );
  }

  private generateDropdownHtml() {
    // arrow function is needed to preserve this
    const itemsList = this.items.map(elem => this.createItemElem(elem));
    return (
      <ul className="dropdown-menu" role="menu">
        { itemsList }
      </ul>
    );
  }

  private hideDropdown() { this.dropdownElement.style.display = 'none'; }
  private showDropdown() { this.dropdownElement.style.display = 'block'; }

  private toggleDropdown() {
    const wasShown = this.dropdownElement.style.display === 'block';
    if (wasShown) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  private addListeners() {
    document.body.addEventListener('click', e => {
      if (e.target === this.dropdownWrap || this.dropdownWrap.contains(e.target as HTMLElement)) {
        return;
      }
      this.hideDropdown();
    });
  }

  private handleItemClick(e: Event, callback: () => void) {
    e.preventDefault();
    callback();
    this.hideDropdown();
  }

}
