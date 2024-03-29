import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import { waitForLoad, addEventListener } from '~/utils/dom';
import isSchoolEvent from '~/utils/school-events';

// const domQuery = {
//   input: () => document.querySelector('#search-text-box') as HTMLInputElement, // directory search box
//   search: () => document.querySelector('#search-directory-button') as HTMLButtonElement, // directory search button
// };

// like a normal querySelector but can't be a specefied already existing element
function domQuery<T extends Element>(selector: string, nononode: T) {
  return () => {
    const el = document.querySelector<T>(selector);
    return el !== nononode && el;
  };
}

let input: HTMLInputElement;
let mobileInput: HTMLInputElement;
let search: HTMLElement;
let mobileSearch: HTMLElement;

async function autoSearchMain(opts: void, unloaderContext: UnloaderContext) {
  input = await waitForLoad(domQuery('#search-text-box', input));
  search = await waitForLoad(domQuery('#search-directory-button', search));
  const listener = addEventListener(input, 'input', () => search.click()); // click the search button whenever you type, does not affect focus
  unloaderContext.addRemovable(listener);

  mobileInput = await waitForLoad(domQuery('#mobile-search-text-box', mobileInput));
  mobileSearch = await waitForLoad(domQuery('#mobile-search-directory-button', mobileSearch));
  const mobileListener = addEventListener(mobileInput, 'input', () => mobileSearch.click()); // click the search button whenever you type, does not affect focus
  unloaderContext.addRemovable(mobileListener);

  // assasins
  if (await isSchoolEvent('brusherGames')) {
    const header = await waitForLoad<HTMLElement>(() => document.querySelector('#overview'));
    if (header.innerText.startsWith('Students Directory')) {
      input.placeholder = 'Looking for your target?';
      mobileInput.placeholder = 'Looking for your target?';
    }
  }
}

export default registerModule('{c225ac4b-9352-4fd3-9229-4f21f1246618}', {
  name: 'Directory Auto Search',
  description: 'Automatically reloads directory as you type for quicker searching',
  main: autoSearchMain,
});
