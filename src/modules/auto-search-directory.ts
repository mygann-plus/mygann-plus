import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

const domQuery = {
  input: () => document.querySelector('#search-text-box') as HTMLInputElement, // directory search box
  search: () => document.querySelector('#search-directory-button') as HTMLButtonElement, // directory search button
};

async function autoSearchMain() {
  const input = await waitForLoad(domQuery.input);
  const search = await waitForLoad(domQuery.search);
  input.addEventListener('input', () => search.click()); // click the search button whenever you type, does not affect focus
}

export default registerModule('{c225ac4b-9352-4fd3-9229-4f21f1246618}', {
  name: 'Directory Auto Search',
  description: 'Automatically reloads directory as you type for quicker searching',
  main: autoSearchMain,
});
