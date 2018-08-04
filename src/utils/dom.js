import flatten from 'array-flatten';

export function waitForLoad(condition, optionalDocument) {

  const document = optionalDocument || window.document;

  return new Promise(res => {

    if (condition()) {
      return res();
    }

    const observer = new MutationObserver(() => {
      if (condition()) {
        res();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

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

export function constructButton(textContent, id, iClassName, onClick) {
  const styles = {
    button: { color: 'black' },
    icon: { visibility: 'visible', marginRight: '5px' },
  };
  return (
    <button id={id} className="btn btn-sm btn-default" onClick={onClick} style={{ color: 'black' }}>
      { iClassName && <i className={iClassName} style={styles.icon} /> }
      { textContent }
    </button>
  );
}

export function insertCss(css) {
  const styleElem = document.createElement('style');
  styleElem.textContent = css;
  document.head.appendChild(styleElem);
  return {
    remove() {
      if (styleElem && styleElem.parentNode) {
        styleElem.remove();
      }
    },
  };
}

export function addEventListeners(nodes, event, callback) {
  for (const node of nodes) {
    node.addEventListener(event, callback);
  }
}
