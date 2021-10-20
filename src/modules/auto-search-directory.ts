import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import { waitForLoad, addEventListener } from '~/utils/dom';

// const domQuery = {
//   input: () => document.querySelector('#search-text-box') as HTMLInputElement, // directory search box
//   search: () => document.querySelector('#search-directory-button') as HTMLButtonElement, // directory search button
// };

const domQuery = (selector: string, nononode: HTMLElement) => () => {
  const el = document.querySelector(selector) as HTMLElement;
  return el !== nononode && el;
};

let input: HTMLElement;
let search: HTMLElement;

async function autoSearchMain(opts: void, unloaderContext: UnloaderContext) {
  input = await waitForLoad(domQuery('#search-text-box', input));
  search = await waitForLoad(domQuery('#search-directory-button', search));
  const listener = addEventListener(input, 'input', () => search.click()); // click the search button whenever you type, does not affect focus
  unloaderContext.addRemovable(listener);
}

export default registerModule('{c225ac4b-9352-4fd3-9229-4f21f1246618}', {
  name: 'Directory Auto Search',
  description: 'Automatically reloads directory as you type for quicker searching',
  main: autoSearchMain,
});
