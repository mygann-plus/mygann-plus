import registerModule from '~/module';

import { waitForLoad, addEventListener } from '~/utils/dom';

const pageTypes = {
  progress: {
    key: 'progress',
    name: 'Progress',
    hash: '#studentmyday/progress',
  },
  schedule: {
    key: 'schedule',
    name: 'Schedule',
    hash: '#studentmyday/schedule',
  },
  assignmentCenter: {
    key: 'assignmentCenter',
    name: 'Assignment Center',
    hash: '#studentmyday/assignment-center',
  },
  courseRequests: {
    key: 'courseRequests',
    name: 'Course Requests',
    hash: '#studentmyday/course-requests',
  },
};

function getPageHash(key) {
  for (const page in pageTypes) {
    if (pageTypes[page].key === key) {
      return pageTypes[page].hash;
    }
  }
}

const domQuery = () => document.querySelector('#topnav-containter .topnav .first .sky-nav');

async function myDayShortcut(suboptions, unloaderContext) {
  const myDayHeader = await waitForLoad(domQuery);
  const clickListener = addEventListener(myDayHeader, 'click', () => {
    window.location.hash = getPageHash(suboptions.page);
  });
  unloaderContext.addRemovable(clickListener);
}

export default registerModule('{50310672-9670-48a4-8261-2868a426ace6}', {
  name: 'My Day Shortcut',
  description: 'Go directly to a My Day page by clicking on the My Day header',
  init: myDayShortcut,
  defaultEnabled: false,
  suboptions: {
    page: {
      name: 'Page',
      type: 'enum',
      defaultValue: pageTypes.assignmentCenter.key,
      enumValues: {
        [pageTypes.progress.key]: [pageTypes.progress.name],
        [pageTypes.schedule.key]: [pageTypes.schedule.name],
        [pageTypes.assignmentCenter.key]: [pageTypes.assignmentCenter.name],
        [pageTypes.courseRequests.key]: [pageTypes.courseRequests.name],
      },
    },
  },
});
