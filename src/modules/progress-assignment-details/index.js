import registerModule from '~/module';

import { createElement, waitForOne, insertCss, constructButton } from '~/utils/dom';
import {
  addProgressDialogListener,
  sanitizeAssignmentTitle,
  getAssignmentBasicDataFromRow,
} from '~/shared/progress';

import style from './style.css';

const selectors = {
  expand: style.locals.expand,
  details: style.locals.details,
};

async function showAssignmentDetails(assignmentElem) {
  const { long_description: rawDescription } = await getAssignmentBasicDataFromRow(assignmentElem);
  const details = rawDescription && sanitizeAssignmentTitle(rawDescription);
  const detailsElem = (
    <div className={selectors.details}>
      <td colSpan="5">
        { details || <i>This assignment has no details</i> }
      </td>
    </div>
  );
  assignmentElem.after(detailsElem);
}

function hideAssignmentDetails(assignmentElem) {
  const details = assignmentElem.parentNode.querySelector(`.${selectors.details}`);
  if (details) {
    details.remove();
  }
}

function handleExpandClick(e, assignment) {
  const icon = e.target.closest('button').querySelector('i');
  const isOpen = icon.classList.contains('fa-chevron-up');
  if (isOpen) {
    hideAssignmentDetails(assignment);
  } else {
    showAssignmentDetails(assignment);
  }
  icon.classList.toggle('fa-chevron-down');
  icon.classList.toggle('fa-chevron-up');
}

const domQuery = () => document.querySelectorAll('.modal-body tbody tr');

async function insertDetailButtons(unloaderContext) {
  const assignments = await waitForOne(domQuery);
  for (const assignment of assignments) {
    if (assignment.querySelector(`.${selectors.expand}`)) {
      continue;
    }
    const name = assignment.querySelector('[data-heading="Assignment"]');
    const expand = constructButton(
      '', '',
      'fa fa-chevron-down',
      e => handleExpandClick(e, assignment),
      selectors.expand,
    );
    name.appendChild(expand);
    unloaderContext.addRemovable(expand);
  }
}

async function progressAssignmentDetails(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await addProgressDialogListener(() => {
    insertDetailButtons(unloaderContext);
  }, unloaderContext);
}

async function unloadProgressAssignmentDetails() {
  const detailElems = document.querySelectorAll(`.${selectors.details}`);
  for (const details of detailElems) {
    details.remove();
  }
}

export default registerModule('{c2e499b8-a71d-4a68-8dba-7120a6c2ca41}', {
  name: 'Progress Assignment Description',
  description: 'See the description of graded assignments in progress',
  main: progressAssignmentDetails,
  unload: unloadProgressAssignmentDetails,
});
