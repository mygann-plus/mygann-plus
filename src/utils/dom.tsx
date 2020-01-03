import flatten from 'array-flatten';
import classNames from 'classnames';

import log from '~/utils/log';

export function waitForLoad<T>(condition: () => T, root = document.body): Promise<T> {

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
export function waitForOne(condition: () => NodeList | any[], root = document.body) {
  return waitForLoad(() => {
    const resolvedCondition = condition();
    if (!(resolvedCondition instanceof NodeList) && !(resolvedCondition instanceof Array)) {
      log('warn', 'waitForOne condition should return an NodeList');
    }
    if (resolvedCondition && resolvedCondition.length) {
      return resolvedCondition;
    }
  }, root);
}

export function createElement(tagName: string, props: any, ...children: any[]) {
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
        elem.style[styleProp] = prop[styleProp];
      }
    } else if (propName === 'list') {
      elem.setAttribute('list', prop);
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

interface ConstructButtonOpts {
  small?: boolean,
  primary?: boolean,
}

export function constructButton(
  textContent: string,
  id: string,
  iClassName: string,
  onClick: (e: MouseEvent) => void,
  classnames = '',
  opts: ConstructButtonOpts = {}
) {
  const defaultOpts = {
    small: true,
    primary: false,
  };
  const options = { ...defaultOpts, ...opts };
  const styles = {
    button: { color: opts.primary ? 'white' : 'black' },
    icon: { visibility: 'visible', marginRight: textContent ? '5px' : '' },
  };
  return (
    <button
      id={classNames(id, opts.primary && 'gocp-ui-button')}
      className={
        classNames(
          'btn btn-default',
          options.small && 'btn-sm',
          opts.primary && 'btn-primary',
          classnames,
        )
      }
      onClick={onClick}
      style={styles.button}
    >
      { iClassName && <i className={iClassName} style={styles.icon} /> }
      { textContent }
    </button>
  );
}

export function insertCss(css: string) {
  const styleElem = <style>{ css }</style>;
  document.head.appendChild(styleElem);
  return {
    remove() {
      styleElem.remove();
    },
  };
}

export function addEventListener(target: EventTarget, event: string, handler: EventListenerOrEventListenerObject) {
  target.addEventListener(event, handler);
  return {
    remove() {
      target.removeEventListener(event, handler);
    },
  };
}

export function clearNode(node: Node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
