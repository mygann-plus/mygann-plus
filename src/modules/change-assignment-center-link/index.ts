import registerModule from '~/core/module';

import { waitForLoad } from '~/utils/dom';

async function changeLink(domQuery: () => Element) {
  document.querySelector('body');
  const linkButton = await waitForLoad(domQuery);
  try {
    linkButton.setAttribute(
      'href',
      '/app/student#studentmyday/assignment-center',
    );
  // eslint-disable-next-line no-empty
  } catch (error) {}
}

async function changeLinks() {
  const barIcon = () => document.getElementById('assignment-center-btn');
  // const dropDown = () => document.querySelector('#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav.nav-visible > ul > li:nth-child(3) > a');
  // await changeLink(dropDown);
  // let parent = document.querySelector("#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul")
  const parent = () => document.querySelector("#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav > ul");
  const dropDown = await waitForLoad(parent);
  await changeLink(barIcon);
  const elm = () => dropDown.querySelector('li > [href="/lms-assignment/assignment-center/student/"]');
  const link = await waitForLoad(elm);
  try {
    link.setAttribute(
      'href',
      '/app/student#studentmyday/assignment-center',
    );
  // eslint-disable-next-line no-empty
  } catch (error) {}

}

export default registerModule('{eec0a74b-0e45-4ed6-bb40-dbc1955b4dc6}', {
  name: 'Revert Assignment Center To Original Link',
  description:
    // eslint-disable-next-line max-len
    'Changes the url of the "Assignment Center" button (both in the bar and dropdown) to be the original one instead of the new one added in 2024-2025',
  main: changeLinks,
  defaultEnabled: false,
});
