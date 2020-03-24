import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, insertCss } from '~/utils/dom';
import { getTableRowColumnContent } from '~/shared/table';
import { addAssignmentTableMutationObserver } from '~/shared/assignments-center';

import style from './style.css';

const selectors = {
  hiddenAssignment: style.locals['hidden-assignment'],
};

const domQuery = () => document.querySelectorAll('#assignment-center-assignment-items tr');

async function hideAssignmentMain() {
  const assignments = await waitForLoad(domQuery);
  for (const assignment of assignments) {
    const type = getTableRowColumnContent(assignment as HTMLElement, 'Type');
    if (type.trim() === 'Community Service Hours') {
      assignment.classList.add(selectors.hiddenAssignment);
    }
  }
}

async function hideCommunityServiceAssignment(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  hideAssignmentMain();

  const observer = await addAssignmentTableMutationObserver(hideAssignmentMain);
  unloaderContext.addRemovable(observer);
}

export default registerModule('{299b8ce0-c876-4f27-b820-7a2af3c44be2}', {
  name: 'fix.hideCommunityServiceAssignment',
  main: hideCommunityServiceAssignment,
  showInOptions: false,
});
