import registerModule from '~/utils/module';
import { waitForLoad, insertCss } from '~/utils/dom';

import { createMenu, addListeners } from './favorites-ui';
import { getSavedFavorites } from './favorites-model';

import style from './style.css';

async function favorites() {
  await waitForLoad(() => document.querySelector('.topnav > .twoline.parentitem.last'));
  if (document.getElementById('gocp_favorites_menu')) {
    return;
  }

  const menu = await createMenu(await getSavedFavorites());
  const directoriesMenu = document.querySelector('.topnav > .twoline.parentitem.last');

  directoriesMenu.before(menu);
  addListeners();
  insertCss(style.toString());
}

export default registerModule('Favorites', favorites);
