/* eslint-disable max-len */
import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

const domQuery = { // DOM queries became incorrect after 'learning progression' tab was added...
  courseRequestsTab: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(5)') as HTMLElement, // should be (4) when learning progression tab is gone
  courseRequestsMyDayDropdown: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul > li:nth-child(4)') as HTMLElement,
  courseRequestsSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(1) > div > ul > li:nth-child(4)') as HTMLElement,

  conductTab: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(6)') as HTMLElement, // should be (5) when learning progression tab is gone
  conductMyDayDropdown: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul > li.last') as HTMLElement,
  conductSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(1) > div > ul > li:nth-child(5)') as HTMLElement,

  myDay: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first') as HTMLElement,
  myDaySidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(1)') as HTMLElement,

  classesDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(2)') as HTMLElement,
  classesSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(2)') as HTMLElement,

  groupsDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(3)') as HTMLElement,
  groupsSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(3)') as HTMLElement,

  resourcesDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(4)') as HTMLElement,
  resourcesSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(4)') as HTMLElement,

  newsDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(5)') as HTMLElement,
  newsSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(5)') as HTMLElement,

  calenderDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(6)') as HTMLElement,
  calenderSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(6)') as HTMLElement,

  directoriesDropdown: () => document.querySelector('#topnav-containter > ul > li.twoline.parentitem.last') as HTMLElement,
  directoriesSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(7)') as HTMLElement,

  officialNotesTab: () => document.querySelector('#site-user-nav > div > ul > li:nth-child(2)') as HTMLElement,
  officialNotesSidebar: () => document.querySelector('#site-mobile-usernav > ul > li:nth-child(1)') as HTMLElement,

  searbarTab: () => document.querySelector('#site-user-nav > div > ul > li.oneline.first') as HTMLElement,
  searchbarSidebar: () => document.querySelector('#site-mobile-search') as HTMLElement,

  topNav: () => document.querySelector('#site-nav-container') as HTMLElement,
  subNavItems: () => document.querySelector('#site-nav-lower > div > ul') as HTMLElement,

};


async function customizeNavigationBarsMain(opts: customizeNavigationBarsSuboptions) {
  const courseRequestsTab = await waitForLoad(domQuery.courseRequestsTab);
  const courseRequestsMyDayDropdown = await waitForLoad(domQuery.courseRequestsMyDayDropdown);
  const courseRequestsSidebar = await waitForLoad(domQuery.courseRequestsSidebar);

  const conductTab = await waitForLoad(domQuery.conductTab);
  const conductMyDayDropdown = await waitForLoad(domQuery.conductMyDayDropdown);
  const conductSidebar = await waitForLoad(domQuery.conductSidebar);

  const classesDropdown = await waitForLoad(domQuery.classesDropdown);
  const classesSidebar = await waitForLoad(domQuery.classesSidebar);

  const groupsDropdown = await waitForLoad(domQuery.groupsDropdown);
  const groupsSidebar = await waitForLoad(domQuery.groupsSidebar);

  const resourcesDropdown = await waitForLoad(domQuery.resourcesDropdown);
  const resourcesSidebar = await waitForLoad(domQuery.resourcesSidebar);

  const newsDropdown = await waitForLoad(domQuery.newsDropdown);
  const newsSidebar = await waitForLoad(domQuery.newsSidebar);

  const calenderDropdown = await waitForLoad(domQuery.calenderDropdown);
  const calenderSidebar = await waitForLoad(domQuery.calenderSidebar);

  const directoriesDropdown = await waitForLoad(domQuery.directoriesDropdown);
  const directoriesSidebar = await waitForLoad(domQuery.directoriesSidebar);

  const searchbarTab = await waitForLoad(domQuery.searbarTab);
  const searchbarSidebar = await waitForLoad(domQuery.searchbarSidebar);

  const officialNotesTab = await waitForLoad(domQuery.officialNotesTab);
  const officialNotesSidebar = await waitForLoad(domQuery.officialNotesSidebar);

  const topNav = await await waitForLoad(domQuery.topNav);
  const subNavItems = await await waitForLoad(domQuery.subNavItems);

  if (opts.courseRequests) {
    courseRequestsTab.style.display = 'none';
    courseRequestsMyDayDropdown.style.display = 'none';
    courseRequestsSidebar.style.display = 'none';
  }
  if (opts.conduct) {
    conductTab.style.display = 'none';
    conductMyDayDropdown.style.display = 'none';
    conductSidebar.style.display = 'none';
  }
  if (opts.classes) {
    classesDropdown.style.display = 'none';
    classesSidebar.style.display = 'none';
  }
  if (opts.groups) {
    groupsDropdown.style.display = 'none';
    groupsSidebar.style.display = 'none';
  }
  if (opts.resources) {
    resourcesDropdown.style.display = 'none';
    resourcesSidebar.style.display = 'none';
  }
  if (opts.news) {
    newsDropdown.style.display = 'none';
    newsSidebar.style.display = 'none';
  }
  if (opts.calender) {
    calenderDropdown.style.display = 'none';
    calenderSidebar.style.display = 'none';
  }
  if (opts.directories) {
    directoriesDropdown.style.display = 'none';
    directoriesSidebar.style.display = 'none';
  }
  if (opts.searchBar) {
    searchbarTab.style.display = 'none';
    searchbarSidebar.style.display = 'none';
  }
  if (opts.officialNotes) {
    officialNotesTab.style.display = 'none';
    officialNotesSidebar.style.display = 'none';
  }
  if (opts.center) { // centering does not work on news tab
    topNav.style.textAlign = 'center';
    subNavItems.style.width = 'max-content';
    subNavItems.style.textAlign = 'center';
  }
}

interface customizeNavigationBarsSuboptions {
  courseRequests: boolean;
  conduct: boolean;
  classes: boolean;
  groups: boolean;
  resources: boolean;
  news: boolean;
  calender: boolean;
  directories: boolean;
  searchBar: boolean;
  officialNotes: boolean;
  center: boolean;
}

export default registerModule('{9efc9b14-c418-4d64-8550-cd67766f8194}', {
  name: 'Customize Navigation Bar',
  description: 'Customize the navigation bar to only display dropdowns, tabs, and buttons that you need.',
  defaultEnabled: false,
  main: customizeNavigationBarsMain,
  suboptions: {
    courseRequests: {
      name: 'Hide course requests tab',
      type: 'boolean',
      defaultValue: false,
    },
    conduct: {
      name: 'Hide conduct tab',
      type: 'boolean',
      defaultValue: false,
    },
    classes: {
      name: 'Hide classes dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    groups: {
      name: 'Hide groups dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    resources: {
      name: 'Hide resources dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    news: {
      name: 'Hide news dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    calender: {
      name: 'Hide calender button',
      type: 'boolean',
      defaultValue: false,
    },
    directories: {
      name: 'Hide directories dropdown',
      type: 'boolean',
      defaultValue: false,
    },
    searchBar: {
      name: 'Hide search bar on top banner',
      type: 'boolean',
      defaultValue: false,
    },
    officialNotes: {
      name: 'Hide official notes button on top banner',
      type: 'boolean',
      defaultValue: false,
    },
    center: {
      name: 'Center navigation bars',
      type: 'boolean',
      defaultValue: false,
    },
  },
});
