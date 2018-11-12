import flatten from 'array-flatten';
import classNames from 'classnames';

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
