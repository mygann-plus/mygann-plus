import { waitForLoad, removeElement } from '../utils/dom';
import registerModule from '../utils/module';

async function filterWebsiteMainSearch(options) {
  await waitForLoad(() => document.getElementsByClassName('bb-tile-title')[0]);

  const elem = document.getElementsByClassName('bb-tile-title')[0].parentNode;
  const parent = document.getElementById('search_summary_results');

  switch (options.hidingType) {
    case 'Collapse':
    default:
      elem.children[1].style.height = '0px';
      document.getElementsByClassName('bb-tile-title')[0].click();
      // TODO: make these three methods different options
      // move to bottom:
      // const elem = document.getElementsByClassName('bb-tile-title')[0].parentNode;
      // const parent = document.getElementById('search_summary_results');
      // parent.appendChild(elem);
      // remove:
      // parent.removeChild(elem);
    });
}

export default registerModule('Filter Gann Website from Search', filterWebsiteMainSearch);

