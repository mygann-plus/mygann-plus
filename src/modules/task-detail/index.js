import registerModule from '~/module';

import { waitForLoad, insertCss } from '~/utils/dom';
import { addAssignmentTableMutationObserver } from '~/shared/assignments-center';

import insertPage from './task-detail-page';
import { addTaskLinks, addDetailsInputListener } from './task-detail-assignment-list';

import style from './style.css';

const domQuery = {
  siteMain: () => document.querySelector('#site-main'),
};

async function assignmentCenter(unloaderContext) {
  addDetailsInputListener(unloaderContext);
  addTaskLinks(unloaderContext);
  const observer = await addAssignmentTableMutationObserver(async () => {
    addDetailsInputListener(unloaderContext);
    addTaskLinks(unloaderContext);
  });
  unloaderContext.addRemovable(observer);
}

async function taskDetailPage() {
  const siteMain = await waitForLoad(domQuery.siteMain);
  const page = await insertPage(siteMain);

  const observer = new MutationObserver(async () => {
    if (document.body.contains(page)) {
      return;
    }
    insertPage(siteMain);
    observer.disconnect();
  });
  observer.observe(siteMain, {
    childList: true,
  });
}

async function taskDetail(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  if (window.location.hash === '#studentmyday/assignment-center') {
    assignmentCenter(unloaderContext);
  } else if (window.location.hash.includes('#taskdetail')) {
    taskDetailPage();
  }
}

async function unloadTaskDetail() {
  if (window.location.hash.startsWith('#taskdetail')) {
    window.location.hash = '#studentmyday/assignment-center';
  }
}

export default registerModule('{fc287488-1185-4395-9e41-9e8e35148f9d}', {
  name: 'Task Details',
  description: 'Add description to "My Tasks"',
  main: taskDetail,
  unload: unloadTaskDetail,
  affectsGlobalState: true,
});
