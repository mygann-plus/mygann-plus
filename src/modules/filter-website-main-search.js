import { waitForLoad } from '../utils/dom';
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
      break;
    case 'Move To Bottom':
      parent.appendChild(elem);
      break;
    case 'Remove':
      elem.remove();
  }

}

export default registerModule('Filter Website from Search', filterWebsiteMainSearch, {
  description: 'Hide results from the Gann Website in OnCampus searches',
  options: {
    hidingType: {
      name: 'Hiding Type',
      type: 'enum',
      defaultValue: 'Collapse',
      enumValues: ['Collapse', 'Move To Bottom', 'Remove'],
    },
  },
});

