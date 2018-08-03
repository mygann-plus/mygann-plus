import registerModule from '~/utils/module';
import { waitForLoad } from '~/utils/dom';

async function filterWebsiteMainSearch(options) {
  await waitForLoad(() => document.querySelector('.bb-tile-title'));

  const title = document.querySelector('.bb-tile-title');
  const elem = title.parentNode;
  const parent = document.querySelector('#search_summary_results');

  if (title.dataset.target !== '#searchSummaryPages') {
    return;
  }

  switch (options.hidingType) {
    case 'Collapse':
    default:
      elem.children[1].style.height = '0px';
      title.click();
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
  defaultEnabled: false,
  options: {
    hidingType: {
      name: 'Hiding Type',
      type: 'enum',
      defaultValue: 'Collapse',
      enumValues: ['Collapse', 'Move To Bottom', 'Remove'],
    },
  },
});

