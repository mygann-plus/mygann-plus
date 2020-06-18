/* Futher developments will be uploaded when more information is available */

import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';


const domQuery = {
  button: () => document.querySelector('#course-requests-btn') as HTMLElement,
  dropdown: () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul > li:nth-child(4)') as HTMLElement,
  sidebar: () => document.querySelector('#site-mobile-sitenav > ul > li:nth-child(1) > div > ul > li:nth-child(4)') as HTMLElement,
};

async function hideCourseRequestsMain() {
  const courseRequestsButton = await waitForLoad(domQuery.button);
  const courseRequestsDropdown = await waitForLoad(domQuery.dropdown);
  const courseRequestsSidebar = await waitForLoad(domQuery.sidebar);

  courseRequestsButton.style.display = 'none';
  courseRequestsDropdown.style.display = 'none';
  courseRequestsSidebar.style.display = 'none';
}

export default registerModule('{683a9158-9030-4015-bca6-3513b21caf72}', {
  name: 'Hide Course Requests Button',
  description: 'Hide course requests button until courses are available.',
  main: hideCourseRequestsMain,
});
