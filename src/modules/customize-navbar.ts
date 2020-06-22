/* eslint-disable max-len */
import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

const domQuery = {
  courseRequestsTab: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(4)') as HTMLElement,
  courseRequestsMyDayDropdown: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul > li:nth-child(4)') as HTMLElement,
  courseRequestsSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(1) > div > ul > li:nth-child(4)') as HTMLElement,

  conductTab: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(5)') as HTMLElement,
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

  topBar: () => document.querySelector('#site-nav-container') as HTMLElement,
  subNav: () => document.querySelector('#site-nav-lower') as HTMLElement,
  navBars: () => document.querySelector('#site-top-spacer') as HTMLElement,

};


async function customizeNavigationBarsMain(opts: customizeNavigationBarsSuboptions) {
  const courseRequestsTab = await waitForLoad(domQuery.courseRequestsTab);
  const courseRequestsMyDayDropdown = await waitForLoad(domQuery.courseRequestsMyDayDropdown);
  const courseRequestsSidebar = await waitForLoad(domQuery.courseRequestsSidebar);

  const conductTab = await waitForLoad(domQuery.conductTab);
  const conductMyDayDropdown = await waitForLoad(domQuery.conductMyDayDropdown);
  const conductSidebar = await waitForLoad(domQuery.conductSidebar);

  const myDay = await waitForLoad(domQuery.myDay);
  const myDaySidebar = await waitForLoad(domQuery.myDaySidebar);

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

  const topBar = await await waitForLoad(domQuery.topBar);
  const subNav = await await waitForLoad(domQuery.subNav);
  const navBars = await await waitForLoad(domQuery.navBars);

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
  if (opts.myDay) {
    myDay.style.display = 'none';
    myDaySidebar.style.display = 'none';
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
  if (myDay.style.display === 'none'
      && classesDropdown.style.display === 'none'
      && groupsDropdown.style.display === 'none'
      && resourcesDropdown.style.display === 'none'
      && newsDropdown.style.display === 'none'
      && calenderDropdown.style.display === 'none'
      && directoriesDropdown.style.display === 'none') {
    topBar.style.display = 'none';
    subNav.style.top = '46px';
    navBars.style.height = '134px';
  }
}

interface customizeNavigationBarsSuboptions {
  courseRequests: boolean;
  conduct: boolean;
  myDay: boolean;
  classes: boolean;
  groups: boolean;
  resources: boolean;
  news: boolean;
  calender: boolean;
  directories: boolean;
  searchBar: boolean;
  officialNotes: boolean;
}

export default registerModule('{9efc9b14-c418-4d64-8550-cd67766f8194}', {
  name: 'Customize Navigation Bar',
  description: 'Customize the navigation bar to only display dropdowns, tabs, and buttons that you need.',
  main: customizeNavigationBarsMain,
  suboptions: {
    conduct: {
      name: 'Hide conduct tab',
      type: 'boolean',
      defaultValue: false,
    },
    myDay: {
      name: 'Hide My Day dropdown',
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
  },
});
