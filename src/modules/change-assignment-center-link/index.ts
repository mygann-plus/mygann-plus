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
  } catch (error) {}
}

async function changeLinks() {
  const barIcon = () => document.getElementById('assignment-center-btn');
  const dropDown = () => document.querySelector(
    '#topnav-containter > ul > li.oneline.parentitem.first > div.subnav.sec-75-bordercolor.white-bgc.sky-nav.nav-visible > ul > li:nth-child(3) > a',
  );
  await changeLink(dropDown);
  await changeLink(barIcon);
}

export default registerModule('{eec0a74b-0e45-4ed6-bb40-dbc1955b4dc6}', {
  name: 'Revert Assignment Center To Original Link',
  description:
    // eslint-disable-next-line max-len
    'Changes the url of the "Assignment Center" button to be the original one instead of the new one added in 2024-2025',
  main: changeLinks,
  defaultEnabled: false,
});
