import flatten from 'array-flatten';
import classNames from 'classnames';

import log from '~/utils/log';

export function waitForLoad(condition, root = document.body) {

  return new Promise(res => {

    const resolvedCondition = condition();
    if (resolvedCondition) {
      return res(resolvedCondition);
    }

    const observer = new MutationObserver(() => {
      const resolvedCondition = condition(); // eslint-disable-line no-shadow
      if (resolvedCondition) {
        res(resolvedCondition);
        observer.disconnect();
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });
  });

}

// waits for a non-empty array
export function waitForOne(condition, root = document.body) {
  return waitForLoad(() => {
    const resolvedCondition = condition();
    if (!(resolvedCondition instanceof NodeList)) {
      log('warn', 'waitForOne condition should return an NodeList');
    }
    if (resolvedCondition && resolvedCondition.length) {
      return resolvedCondition;
    }
  }, root);
}

export function createElement(tagName, props, ...children) {
  const elem = document.createElement(tagName);

  for (const propName in props) {
    const prop = props[propName];
    if (/^on[A-Z]/.test(propName)) {
      let listener;
      let opts = {};
      if (typeof prop === 'function') {
        listener = prop;
      } else {
        // bogus error
        listener = prop.listener; // eslint-disable-line prefer-destructuring
        Object.assign(opts, prop);
      }
      elem.addEventListener(propName.slice(2).toLowerCase(), listener, opts);
    } else if (propName === 'dataset') {
      Object.assign(elem.dataset, prop);
    } else if (propName === 'style') {
      for (const styleProp in prop) {
        if (styleProp.includes('-')) {
          elem.style.setProperty(styleProp, prop[styleProp]);
        } else {
          elem.style[styleProp] = prop[styleProp];
        }
      }
    } else {
      elem[propName] = prop;
    }
  }

  for (let child of flatten(children)) {
    if (child == null) {
      continue;
    }
    if (typeof child !== 'object') {
      child = document.createTextNode(child.toString());
    }
    elem.appendChild(child);
  }

  return elem;
}

export function constructButton(textContent, id, iClassName, onClick, classnames = '') {
  const styles = {
    button: { color: 'black' },
    icon: { visibility: 'visible', marginRight: '5px' },
  };
  return (
    <button
      id={id}
      className={classNames('btn btn-sm btn-default', classnames)}
      onClick={onClick}
      style={{ color: 'black' }}
    >
      { iClassName && <i className={iClassName} style={styles.icon} /> }
      { textContent }
    </button>
  );
}

export function insertCss(css) {
  const styleElem = <style>{ css }</style>;
  document.head.appendChild(styleElem);
  return {
    remove() {
      styleElem.remove();
    },
  };
}

export function addEventListener(elem, ...params) {
  elem.addEventListener(...params);
  return {
    remove() {
      elem.removeEventListener(...params);
    },
  };
}

export function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export class DropdownMenu {

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
      '', '',
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
    const itemStyles = { textDecoration: 'none' };
    return (
      <li>
        <a
          href="#"
          style={ itemStyles }
          onClick={e => this._handleItemClick(e, item.onclick)}
        >
          { item.title }
        </a>
      </li>
    );
  }

  _generateDropdownHtml() {
    const itemsList = this.items.map(this._createItemElem);
    return (
      <ul className="dropdown-menu" role="menu" style="display: block;">
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
