import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { addAssignmentTableMutationObserver } from '~/shared/assignments-center';
import { waitForOne, insertCss } from '~/utils/dom';

import style from './style.css';

const selectors = {
  hidden: style.locals.hidden,
};

const domQuery = () => document.querySelectorAll('[data-heading="Assign"], [data-heading="Due"]');

async function removeAssignmentTimes() {
  const assignmentDates = await waitForOne(domQuery);
  for (const date of assignmentDates) {
    const time = date.querySelector('div');
    if (time) {
      time.classList.add(selectors.hidden);
    }
  }
}

async function hideAssignmentTimesMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  removeAssignmentTimes();
  const observer = await addAssignmentTableMutationObserver(removeAssignmentTimes);
  unloaderContext.addRemovable(observer);
}

function unloadHideAssignmentTimes() {
  const hiddenTimes = document.getElementsByClassName(selectors.hidden);
  for (const time of hiddenTimes) {
    time.classList.remove(selectors.hidden);
  }
}

export default registerModule('{772d753d-2785-4353-bd7b-0669ee3bced5}', {
  name: 'Hide Assignment Times',
  description: 'Only show the date of when an assignment is assigned or due, hiding the specific time of day',
  main: hideAssignmentTimesMain,
  unload: unloadHideAssignmentTimes,
});
