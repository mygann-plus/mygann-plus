import flatten from 'array-flatten';
import classNames from 'classnames';

import log from '~/utils/log';

// eslint-disable-next-line max-len
export function waitForLoad<T>(condition: () => T, root = document.body /* , filterElements?: T[] */): Promise<T> {

  return new Promise(res => {

    const resolvedCondition = condition();
    if (resolvedCondition /* && !filterElements.includes(resolvedCondition) */) {
      return res(resolvedCondition);
    }

    const observer = new MutationObserver(() => {
      const resolvedCondition = condition(); // eslint-disable-line no-shadow
      if (resolvedCondition /* && !filterElements.includes(resolvedCondition) */) {
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
// If filterNull is true, ignore all elements in the array that are null
export function waitForOne(
  condition: () => NodeList | HTMLElement[],
  filterNull?: boolean,
  filterElements?: HTMLElement[],
  root = document.body,
): Promise<HTMLElement[]> {
  return waitForLoad(() => {
    const resolvedCondition = condition();
    if (!(resolvedCondition instanceof NodeList) && !(resolvedCondition instanceof Array)) {
      log('warn', 'waitForOne condition should return an NodeList');
    }
    if (resolvedCondition && resolvedCondition.length) {
      if (filterNull) {
        const filtered = Array.from(resolvedCondition).filter(k => k !== null);
        return filtered.length && filtered as HTMLElement[];
      }
      return Array.from(resolvedCondition) as HTMLElement[];
    }
  }, root, filterElements);
}

export function createElement(tagName: string, props: any, ...children: any[]) {
  const elem = document.createElement(tagName);

  for (const propName in props) {
    const prop = props[propName];
    if (/^on[A-Z]/.test(propName)) {
      let listener: (e: Event) => void;
      let opts = {};
      if (typeof prop === 'function') {
        listener = prop;
      } else {
        // bogus error
        listener = prop.listener; // eslint-disable-line prefer-destructuring
        Object.assign(opts, prop);
      }
      elem.addEventListener(propName.slice(2).toLowerCase(), (e: Event) => listener(e), opts);
    } else if (propName === 'dataset') {
      Object.assign(elem.dataset, prop);
    } else if (propName === 'style') {
      for (const styleProp in prop) {
        // workaround since elem.style is indexed by number
        (elem.style as any)[styleProp] = prop[styleProp];
      }
    } else if (propName === 'list') {
      elem.setAttribute('list', prop);
    } else {
      // workaround to set arbitrary property, which has been validated in JSX
      (elem as any)[propName] = prop;
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

interface ConstructButtonConfig {
  textContent?: string;
  id?: string;
  iClassName?: string;
  className?: string;
  onClick?: (e: MouseEvent) => void;
  small?: boolean,
  primary?: boolean,
}

export function constructButton(config: ConstructButtonConfig): HTMLButtonElement {

  const defaultConfig = {
    textContent: '',
    id: '',
    iClassName: '',
    className: '',
    onClick: () => { },
    small: true,
    primary: false,
  };

  const {
    textContent, id, iClassName, className, onClick, small, primary,
  } = { ...defaultConfig, ...config };

  const styles = {
    button: { color: primary ? 'white' : 'black' },
  };
  const button = (
    <button
      id={classNames(id, primary && 'gocp-ui-button')}
      className={
        classNames(
          'btn btn-default',
          small && 'btn-sm',
          primary && 'btn-primary',
          className,
        )
      }
      onClick={(e: any) => onClick(e)}
      style={styles.button}
    >
      {
        iClassName
        && <i
          className={iClassName}
          style={{ visibility: 'visible', marginRight: textContent ? '5px' : '' }}
        />
      }
      { textContent }
    </button>
  );
  return button as HTMLButtonElement;
}

export function constructCheckbox(
  isChecked: boolean,
  isDisabled: boolean,
  onChange: EventListener = () => { },
) {
  return (
    <label className="bb-check-wrapper">
      <input
        type="checkbox"
        className="field"
        checked={isChecked}
        onChange={(e: any) => onChange(e)}
        disabled={isDisabled}
      />
      <span className="check-label bb-check-checkbox"></span>
    </label>
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

export function addEventListener(
  target: EventTarget,
  event: string,
  handler: EventListenerOrEventListenerObject,
) {
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
