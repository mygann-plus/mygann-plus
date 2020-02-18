import registerModule from '~/module';
import { waitForLoad } from '~/utils/dom';

const selectors = {
  pagesResults: 'gocp_filter-website-main-search_pages-results',
};

const hidingTypes = {
  collapse: 'collapse',
  moveToBottom: 'moveToBottom',
  remove: 'remove',
};

function isCollapsed(resultsElem) {
  return !!resultsElem.querySelector('.collapsed');
}

async function filterWebsiteMainSearch(options) {
  await waitForLoad(() => document.querySelector('.bb-tile-title'));

  const title = document.querySelector('.bb-tile-title');
  const elem = title.parentNode;
  const parent = document.querySelector('#search_summary_results');

  if (title.dataset.target !== '#searchSummaryPages') {
    return;
  }
  elem.classList.add(selectors.pagesResults);

  switch (options.hidingType) {
    case hidingTypes.collapse:
    default:
      if (!isCollapsed(elem)) {
        elem.children[1].style.height = '0px'; // prevents closing animation
        title.click();
      }
      break;
    case hidingTypes.moveToBottom:
      parent.appendChild(elem);
      break;
    case hidingTypes.remove:
      elem.style.display = 'none';
  }

}

function unloadFilterWebsiteMainSearch(options) {
  const elem = document.querySelector(`.${selectors.pagesResults}`);
  const parent = document.querySelector('#search_summary_results');

  if (!elem) {
    return;
  }

  switch (options.hidingType) {
    case hidingTypes.collapse:
      if (isCollapsed(elem)) {
        document.querySelector('.bb-tile-title').click();
      }
      break;
    case hidingTypes.moveToBottom:
      parent.prepend(elem);
      break;
    case hidingTypes.remove:
      elem.style.display = '';
      break;
    default:
      break;
  }
}

export default registerModule('{d560bad4-1073-4452-ac11-f4466dc19184}', {
  name: 'Filter Website from Search',
  description: 'Hide results from the Gann Website in MyGann searches',
  main: filterWebsiteMainSearch,
  unload: unloadFilterWebsiteMainSearch,
  defaultEnabled: false,
  suboptions: {
    hidingType: {
      name: 'Hiding Type',
      type: 'enum',
      defaultValue: hidingTypes.collapse,
      enumValues: {
        [hidingTypes.collapse]: 'Collapse',
        [hidingTypes.moveToBottom]: 'Move To Bottom',
        [hidingTypes.remove]: 'Remove',
      },
    },
  },
});
