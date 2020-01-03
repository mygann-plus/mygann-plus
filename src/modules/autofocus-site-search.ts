import registerModule from '~/core/module';

import { waitForLoad, addEventListener } from '~/utils/dom';
import tick from '~/utils/tick';
import { UnloaderContext } from '~/core/module-loader';

const domQuery = {
  searchButton: () => document.querySelector('.topnav .oneline'),
  searchbar: () => document.querySelector('#site-search-input') as HTMLElement,
};

async function autofocusSiteSearch(opts: void, unloaderContext: UnloaderContext) {
  const searchButton = await waitForLoad(domQuery.searchButton);
  const searchbar = await waitForLoad(domQuery.searchbar);

  const listener = addEventListener(searchButton, 'click', async () => {
    await tick(); // wait for input to be shown
    searchbar.focus();
  });

  unloaderContext.addRemovable(listener);
}

export default registerModule('{84658351-f212-4f93-90b7-4163666cc697}', {
  name: 'fix.autofocusSiteSearch',
  main: autofocusSiteSearch,
  showInOptions: false,
});
