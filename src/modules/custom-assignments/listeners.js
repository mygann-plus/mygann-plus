import { nodeListToArray, waitForLoad } from '../../utils/dom';
import { addFilterStatusListener } from './filter/filter-status';
import { addFilterClassesListener } from './filter/filter-classes';

function addSortListeners(renderFunction) {
  nodeListToArray(document.getElementsByClassName('assignment-table-sort')).forEach(sort => {
    sort.addEventListener('click', () => {
      setTimeout(() => {
        renderFunction();
      }, 1);
    });
  });
}
function addDateListeners(renderFunction) {
  const dateElement = document.getElementsByClassName('hidden-lg text-center bb-section-heading')[0];
  const observer = new MutationObserver(() => {
    waitForLoad(() => document.getElementById('assignment-center-assignment-items').children.length)
      .then(() => {
        renderFunction();
      });
  });

  // rerender when date changes
  observer.observe(dateElement, {
    childList: true,
  });
}
export default function addListeners(renderFunction) {
  addSortListeners(renderFunction);
  addDateListeners(renderFunction);
  addFilterStatusListener(renderFunction);
  addFilterClassesListener(renderFunction);
}
