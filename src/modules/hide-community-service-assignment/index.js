import registerModule from '~/module';

import { waitForLoad, insertCss } from '~/utils/dom';
import { getTableRowColumnContent } from '~/shared/table';
import { addAssignmentTableMutationObserver } from '~/shared/assignments-center';

import style from './style.css';

const selectors = {
  hiddenAssignment: style.locals['hidden-assignment'],
};

const domQuery = () => document.querySelectorAll('#assignment-center-assignment-items tr');

async function hideAssignment() {
  const assignments = await waitForLoad(domQuery);
  for (const assignment of assignments) {
    const type = getTableRowColumnContent(assignment, 'Type');
    if (type.trim() === 'Community Service Hours') {
      assignment.classList.add(selectors.hiddenAssignment);
    }
  }
}

async function hideCommunityServiceAssignment(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  hideAssignment();

  const observer = addAssignmentTableMutationObserver(hideAssignment);
  unloaderContext.addRemovable(observer);
}

export default registerModule('{299b8ce0-c876-4f27-b820-7a2af3c44be2}', {
  name: 'Hide Community Service Assignment',
  main: hideCommunityServiceAssignment,
});
