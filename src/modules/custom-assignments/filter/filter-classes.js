import { waitForLoad, nodeListToArray } from '../../../utils/dom';

let hiddenClasses = [];

// called in listeners
export function addFilterClassesListener(renderFunction) {
  waitForLoad(() => document.getElementById('filter-student-sections'))
    .then(() => {
      document.getElementById('filter-student-sections').addEventListener('click', () => {
        waitForLoad(() => document.getElementById('btn-filter-apply'))
          .then(() => {
            document.getElementById('btn-filter-apply').addEventListener('click', () => {
              hiddenClasses = nodeListToArray(document.getElementsByClassName('pull-left btn btn-approve section-button'))
                .filter(e => e.className.indexOf('active') === -1)
                .map(e => e.nextSibling.textContent.trim());
              renderFunction();
            });
          });
      });
    });
}

export default function filterClasses(assignment) {
  return hiddenClasses.indexOf(assignment.className.trim()) === -1;
}
