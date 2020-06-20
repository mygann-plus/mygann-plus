/* eslint-disable max-len */
import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

const domQuery = {
  // course requests
  courseRequestsTab: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(4)') as HTMLElement,
  courseRequestsMyDayDropdown: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul > li:nth-child(4)') as HTMLElement,
  courseRequestsSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(1) > div > ul > li:nth-child(4)') as HTMLElement,

  // conduct
  conductTab: () => document.querySelector('#site-nav-lower > div > ul > li:nth-child(5)') as HTMLElement,
  conductMyDayDropdown: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul > li.last') as HTMLElement,
  conductSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(1) > div > ul > li:nth-child(5)') as HTMLElement,

  // classes
  classesDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(2)') as HTMLElement,
  classesSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(2)') as HTMLElement,

  // groups
  groupsDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(3)') as HTMLElement,
  groupsSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(3)') as HTMLElement,

  // resources
  resourcesDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(4)') as HTMLElement,
  resourcesSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(4)') as HTMLElement,

  // news
  newsDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(5)') as HTMLElement,
  newsSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(5)') as HTMLElement,

  // calender
  calenderDropdown: () => document.querySelector('#topnav-containter > ul > li:nth-child(6)') as HTMLElement,
  calenderSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(6)') as HTMLElement,

  // directories
  directoriesDropdown: () => document.querySelector('#topnav-containter > ul > li.twoline.parentitem.last') as HTMLElement,
  directoriesSidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(7)') as HTMLElement,
};


async function customizeNavigationBarsMain(opts: customizeNavigationBarsSuboptions) {
  if (opts.courseRequests) {
    const courseRequestsTab = await waitForLoad(domQuery.courseRequestsTab);
    const courseRequestsMyDayDropdown = await waitForLoad(domQuery.courseRequestsMyDayDropdown);
    const courseRequestsSidebar = await waitForLoad(domQuery.courseRequestsSidebar);
    courseRequestsTab.style.display = 'none';
    courseRequestsMyDayDropdown.style.display = 'none';
    courseRequestsSidebar.style.display = 'none';
  }
  if (opts.conduct) {
    const conductTab = await waitForLoad(domQuery.conductTab);
    const conductMyDayDropdown = await waitForLoad(domQuery.conductMyDayDropdown);
    const conductSidebar = await waitForLoad(domQuery.conductSidebar);
    conductTab.style.display = 'none';
    conductMyDayDropdown.style.display = 'none';
    conductSidebar.style.display = 'none';
  }
  if (opts.classes) {
    const classesDropdown = await waitForLoad(domQuery.classesDropdown);
    const classesSidebar = await waitForLoad(domQuery.classesSidebar);
    classesDropdown.style.display = 'none';
    classesSidebar.style.display = 'none';
  }
  if (opts.groups) {
    const groupsDropdown = await waitForLoad(domQuery.groupsDropdown);
    const groupsSidebar = await waitForLoad(domQuery.groupsSidebar);
    groupsDropdown.style.display = 'none';
    groupsSidebar.style.display = 'none';
  }
  if (opts.resources) {
    const resourcesDropdown = await waitForLoad(domQuery.resourcesDropdown);
    const resourcesSidebar = await waitForLoad(domQuery.resourcesSidebar);
    resourcesDropdown.style.display = 'none';
    resourcesSidebar.style.display = 'none';
  }
  if (opts.news) {
    const newsDropdown = await waitForLoad(domQuery.newsDropdown);
    const newsSidebar = await waitForLoad(domQuery.newsSidebar);
    newsDropdown.style.display = 'none';
    newsSidebar.style.display = 'none';
  }
  if (opts.calender) {
    const calenderDropdown = await waitForLoad(domQuery.calenderDropdown);
    const calenderSidebar = await waitForLoad(domQuery.calenderSidebar);
    calenderDropdown.style.display = 'none';
    calenderSidebar.style.display = 'none';
  }
  if (opts.directories) {
    const directoriesDropdown = await waitForLoad(domQuery.directoriesDropdown);
    const directoriesSidebar = await waitForLoad(domQuery.directoriesSidebar);
    directoriesDropdown.style.display = 'none';
    directoriesSidebar.style.display = 'none';
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
}

export default registerModule('{9efc9b14-c418-4d64-8550-cd67766f8194}', {
  name: 'Customize Navigation Bar',
  description: 'Customize the navigation bar to only display what you need.',
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
  },
});
