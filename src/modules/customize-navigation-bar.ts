import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

/* eslint-disable max-len */
let domQuery = {
  // nav
  classes: () => document.querySelector('#topnav-containter > ul > li:nth-child(2)') as HTMLElement,
  groups: () => document.querySelector('#topnav-containter > ul > li:nth-child(3)') as HTMLElement,
  resources: () => document.querySelector('#topnav-containter > ul > li:nth-child(4)') as HTMLElement,
  news: () => document.querySelector('#topnav-containter > ul > li:nth-child(5)') as HTMLElement,
  calendar: () => document.querySelector('#topnav-containter > ul > li:nth-child(6)') as HTMLElement,
  directory: () => document.querySelector('#topnav-containter > ul > li:nth-child(7)') as HTMLElement,

  // subnav
  progress: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(1)') as HTMLElement,
  schedule: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(2)') as HTMLElement,
  assignmentCenter: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(3)') as HTMLElement,
  courseRequests: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(4)') as HTMLElement,
  conduct: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(5)') as HTMLElement,
  checkList: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(6)') as HTMLElement,

  subNav: () => document.querySelector('#site-nav-lower') as HTMLElement,
  nav: () => document.querySelector('#site-top-spacer') as HTMLElement,
};

async function customizeNavigationBarMain(options: navigationButtons) {
  if (options.classes) (await waitForLoad(domQuery.classes)).style.display = 'none';
  if (options.groups) (await waitForLoad(domQuery.groups)).style.display = 'none';
  if (options.resources) (await waitForLoad(domQuery.resources)).style.display = 'none';
  if (options.news) (await waitForLoad(domQuery.news)).style.display = 'none';
  if (options.calendar) (await waitForLoad(domQuery.calendar)).style.display = 'none';
  if (options.directory) (await waitForLoad(domQuery.directory)).style.display = 'none';

  if (options.progress) (await waitForLoad(domQuery.progress)).style.display = 'none';
  if (options.schedule) (await waitForLoad(domQuery.schedule)).style.display = 'none';
  if (options.assignmentCenter) (await waitForLoad(domQuery.assignmentCenter)).style.display = 'none';
  if (options.courseRequests) (await waitForLoad(domQuery.courseRequests)).style.display = 'none';
  if (options.conduct) (await waitForLoad(domQuery.conduct)).style.display = 'none';
  if (options.checkList) (await waitForLoad(domQuery.checkList)).style.display = 'none';

  // hide subnav
  if (options.progress && options.schedule && options.assignmentCenter && options.courseRequests && options.conduct && options.checkList && options.progress) {
    (await waitForLoad(domQuery.subNav)).style.display = 'none';
    (await waitForLoad(domQuery.nav)).style.height = '120px';
  }
}

interface navigationButtons {
  // nav
  classes: boolean;
  groups: boolean;
  resources: boolean;
  news: boolean;
  calendar: boolean;
  directory: boolean;

  // subnav
  progress: boolean;
  schedule: boolean;
  assignmentCenter: boolean;
  courseRequests: boolean;
  conduct: boolean;
  checkList: boolean;
}

export default registerModule('{4aac8319-d1a1-4852-a2d0-c0e9d8f96dd2}', {
  name: 'Customize Navigation Bars',
  description: 'Hide unused pages in the navigation bar like course requests, conduct (hopefully), check list, or anything else. ',
  defaultEnabled: false,
  main: customizeNavigationBarMain,
  suboptions: {
    // nav
    classes: {
      name: 'Hide Classes dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    groups: {
      name: 'Hide Groups dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    resources: {
      name: 'Hide Resources dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    news: {
      name: 'Hide News dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    calendar: {
      name: 'Hide Calendar dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    directory: {
      name: 'Hide Directory dropdown',
      type: 'boolean',
      defaultValue: false,
    },

    // subnav
    progress: {
      name: 'Hide Progress button',
      type: 'boolean',
      defaultValue: false,
    },
    schedule: {
      name: 'Hide Schedule button',
      type: 'boolean',
      defaultValue: false,
    },
    assignmentCenter: {
      name: 'Hide Assignment Center button',
      type: 'boolean',
      defaultValue: false,
    },
    courseRequests: {
      name: 'Hide Course Requests button',
      type: 'boolean',
      defaultValue: true,
    },
    conduct: {
      name: 'Hide Conduct button',
      type: 'boolean',
      defaultValue: true,
    },
    checkList: {
      name: 'Hide Check List button',
      type: 'boolean',
      defaultValue: true,
    },
  },
});
