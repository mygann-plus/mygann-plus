import registerModule from '~/core/module';
import { loadModule } from '~/core/module-loader';

import { insertCss, waitForLoad } from '~/utils/dom';
import {
  getHeader,
  desktopMenu,
  getTopNavbar,
  getMobileAccountLink,
  mobileMenu,
  getNativeDropdown,
} from '~/shared/user-menu';
import style from '~/shared/user-menu/style.css';

import optionsDialog from '~/modules/options-dialog'; // eslint-disable-line import/no-cycle
import about from '~/modules/about';

async function userMenuLinksMain() {
  insertCss(style.toString());
  await waitForLoad(() => getHeader() && getMobileAccountLink());

  const nav = getTopNavbar();
  nav.lastElementChild.classList.remove('last'); // no longer the last element on the topbar
  nav.appendChild(desktopMenu);

  const mobileLink = getMobileAccountLink();
  mobileLink.before(mobileMenu);

  getNativeDropdown().style.zIndex = '1'; // fix menu going behind MyGann+ menu

  await loadModule(optionsDialog, true);
  await loadModule(about, true);
}

export default registerModule('{be1f2b48-87d7-4067-adc4-f68fb9f95d3b}', {
  name: 'internal.userMenuLinks',
  init: userMenuLinksMain,
  showInOptions: false,
});
