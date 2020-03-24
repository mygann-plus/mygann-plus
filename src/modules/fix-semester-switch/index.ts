import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { insertCss, waitForOne } from '~/utils/dom';
import { addAssignmentTableMutationObserver } from '~/shared/assignments-center';

import style from './style.css';

const selectors = {
  duplicateAssignment: style.locals['duplicate-assignment'],
};

const domQuery = () => document.querySelectorAll('.assignment-status-update');

async function removeDuplicateAssignments() {
  const assignmentStatusUpdate = await waitForOne(domQuery);

  Array.from(assignmentStatusUpdate)
    .map(link => ({
      row: link.closest('tr'),
      id: link.dataset.id,
    }))
    .forEach((assignment, i, assignments) => {
      const index = assignments.indexOf(assignments.find(a => a.id === assignment.id));
      if (index !== i) {
        assignment.row.classList.add(selectors.duplicateAssignment);
      }
    });
}

async function fixSemesterSwitchMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
  removeDuplicateAssignments();

  const observer = await addAssignmentTableMutationObserver(removeDuplicateAssignments);
  unloaderContext.addRemovable(observer);
}

function unloadFixSemesterSwitch() {
  const duplicateAssignments = document.querySelectorAll(`.${selectors.duplicateAssignment}`);
  for (const assignment of duplicateAssignments) {
    assignment.classList.remove(selectors.duplicateAssignment);
  }
}

export default registerModule('{df455955-40f8-4475-9a74-456f8888002d}', {
  name: 'fix.semesterSwitchBug',
  main: fixSemesterSwitchMain,
  unload: unloadFixSemesterSwitch,
  showInOptions: false,
});
