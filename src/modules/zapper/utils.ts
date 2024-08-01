import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import storage from '~/utils/storage';

export function getCssSelector(element: Element): string {
  if (!(element instanceof Element)) {
    throw new Error('Provided argument is not an Element');
  }

  const getSelector = (el: Element): string => {
    if (el.id) {
      return `#${el.id}`;
    }
    if (el.className) {
      return `.${el.className.trim().replace(/\s+/g, '.')}`;
    }
    if (el.tagName) {
      const parent = el.parentElement ? getSelector(el.parentElement) : '';
      return `${parent} > ${el.tagName.toLowerCase()}`;
    }
    return '';
  };

  return getSelector(element);
}

export function listToCss(selectors: string[]): string {
  let full: string = '';
  console.log(selectors);
  for (let s of selectors) {
    console.log(s);
    full += `${s} ,`;
  }
  full = full.slice(0, -1);
  full += ' { display: hidden }';
  return full;
}

export async function loadStyle(path: string = 'zapStyles'): Promise<string[]> {
  // Retrieve data from chrome storage

  try {
    const data = await new Promise<{ [key: string]: string[] }>(
      (resolve, reject) => {
        chrome.storage.sync.get(path, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      },
    );

    // Return the data or a default value if not found
    return data[path] || [''];
  } catch (error) {
    return ['']; // Default value in case of error
  }
}
// NOTE: for now represent as a list of strings in localstorage and then have a toString to make it into css

// writes to storage
// NOTE: should do a basic dif not just append probably?
// - no but when adding new rules it updates based off that - if click is false it removes it, if it's true it adds the style tag
// - when click Escape it saves the config (or a save button)

export function writeStyle(path: string = 'zapStyles', style: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const data = { [path]: style };
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// adds to page
// TODO: put in index.tsx to keep stylesheet var
/*
 * const styleElem = <style>{ css }</style>;
  document.head.appendChild(styleElem);
*/
function addStyle(style: string): void {
  const css = `
  #assignment-center-btn {background: blue}
  /* *:hover {background: rgba(255, 0, 0, .7);}
    `;
  insertCss(css);
}
