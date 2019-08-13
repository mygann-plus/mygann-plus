import registerModule from '~/module';
import { waitForLoad, addEventListener } from '~/utils/dom';
import tick from '~/utils/tick';

const domQuery = {
  searchButton: () => document.querySelector('.topnav .oneline'),
  searchbar: () => document.querySelector('#site-search-input'),
};

async function autofocusSiteSearch(opts, unloaderContext) {
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
