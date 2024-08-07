import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import storage from '~/utils/storage';

export function getCssSelector(el: Element): string {
  if (!(el instanceof Element)) return;
  let path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break;
    } else {
      let sib = el;
      let nth = 1;
      sib = sib.previousElementSibling;
      while (sib) {
        if (sib.nodeName.toLowerCase() === selector) {
          nth++;
        }
        sib = sib.previousElementSibling;
      }
      if (el.previousElementSibling != null || el.nextElementSibling != null) {
        selector += `:nth-of-type(${nth})`;
      }
    }
    path.unshift(selector);
    el = el.parentNode as Element;
  }
  return path.join(' > ');
}

export function listToCss(selectors: string[]): string {
  let full: string = '';
  for (let s of selectors) {
    full += `${s} ,`;
  }
  full = full.slice(0, -1);
  full += ' { display: none }';
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

export function writeStyle(
  path: string = 'zapStyles',
  style: string[],
): Promise<void> {
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
