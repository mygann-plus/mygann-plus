import { waitForLoad, nodeListToArray } from '../../../utils/dom';

let hiddenStatuses = [];
let hidingCompleted = false;

// called in listeners
export function addFilterStatusListener(renderFunction) {
  waitForLoad(() => document.getElementById('filter-status'))
    .then(() => {
      document.getElementById('filter-status').addEventListener('click', () => {
        waitForLoad(() => document.getElementById('btn-filter-apply'))
          .then(() => {
            document.getElementById('btn-filter-apply').addEventListener('click', () => {
              hiddenStatuses = nodeListToArray(document.getElementsByClassName('pull-left btn btn-xs btn-approve status-button'))
                .filter(elem => elem.className.indexOf('active') === -1)
                .map(elem => elem.nextSibling.nextSibling.textContent.trim());
              renderFunction();
            });
          });
      });
    });
  waitForLoad(() => document.getElementById('gocp-toggle-completed'))
    .then(() => {
      document.getElementById('gocp-toggle-completed').addEventListener('click', ({ target }) => {
        hidingCompleted = target.innerText.split(': ')[1] === 'On';
        hiddenStatuses.splice(hiddenStatuses.indexOf('Completed'), 1);
        hiddenStatuses.splice(hiddenStatuses.indexOf('Graded'), 1);
      });
    });
}

export default function filterStatus(assignment) {
  return !(hiddenStatuses.indexOf(assignment.status) > -1 ||
    (hidingCompleted === true && assignment.status === 'Completed'));
}
