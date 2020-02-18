import registerModule from '~/module';

import { createElement } from '~/utils/dom';
import Dialog from '~/utils/dialog';

import {
  getDayViewDateString,
  registerAnnouncementDropdownLink,
  insertAnnouncementDropdown,
} from '~/shared/schedule';
import getServeryMenu from './servery-menu-model';

function createMenuItemElem(menuItem) {
  const attributes = [];
  if (menuItem.parve) { attributes.push('parve'); }
  if (menuItem.gf) { attributes.push('gf'); }
  return (
    <li>
      { menuItem.name }&nbsp;
      {
        attributes.length
          ? <span>({ attributes.join(', ') })</span>
          : null
      }
    </li>
  );
}

async function getMonthData(dateString) {
  const date = new Date(dateString);
  const menuData = await getServeryMenu();
  for (const monthData of menuData) {
    if (monthData.month === date.getMonth() + 1 && monthData.year === date.getFullYear()) {
      return monthData;
    }
  }
}

// dateString is in dayViewDateString format
async function getMenuItems(dateString) {
  const date = new Date(dateString);
  const monthData = await getMonthData(dateString);
  if (!monthData) {
    return [];
  }
  for (const dayData of monthData.menu) {
    if (dayData.date === date.getDate()) {
      return dayData.items;
    }
  }
  return [];
}

async function showMenuDialog() {
  const dateString = await getDayViewDateString();
  const menuItems = await getMenuItems(dateString);
  const { link } = await getMonthData(dateString);
  const menuElem = (
    <div>
      Servery Menu for { dateString }:
      <ul>
        { menuItems.map(createMenuItemElem) }
      </ul>
      <a href={link} target="_blank" rel="noopener noreferrer">View This Month&apos;s Full Menu</a>
    </div>
  );
  const dialog = new Dialog('Servery Menu', menuElem, {
    leftButtons: [Dialog.buttons.CLOSE],
  });
  dialog.open();
}

async function shouldShowMenu() {
  const serveryMenuItems = await getMenuItems(await getDayViewDateString());
  return serveryMenuItems.length > 0;
}

async function serveryMenu(opts, unloaderContext) {
  // const styles = insertCss(style.toString());
  // unloaderContext.addRemovable(styles);

  const serveryMenuItems = getMenuItems(await getDayViewDateString());
  registerAnnouncementDropdownLink({
    title: 'Servery Menu',
    id: 'servery-menu',
    onclick: () => showMenuDialog(serveryMenuItems),
    shouldShow: shouldShowMenu,
  });
  insertAnnouncementDropdown(unloaderContext);
}

export default registerModule('{34605f96-a07c-4beb-90e8-933337d192fd}', {
  name: 'Servery Menu',
  description: 'Show the daily servery menu in schedule',
  main: serveryMenu,
});
