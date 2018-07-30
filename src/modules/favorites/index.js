import registerModule from '../../utils/module';
import { waitForLoad, insertCss } from '../../utils/dom';

import { createMenu, addListeners } from './favorites-ui';
import { getSavedFavorites } from './favorites-model';

function insertControlStyle() {
  insertCss(`
    .gocp_favorites_controls > i {
      font-size: 15px;
      margin-right: 4px;
      background: #fff2c0;
      padding: 3px;
      color: black;
      display: none;
    }
    .gocp_favorites_link:hover .gocp_favorites_controls > i {
      display: inline;
    }
  `);
}

async function favorites() {
  await waitForLoad(() => document.querySelector('.topnav > .twoline.parentitem.last'));
  if (document.getElementById('gocp_favorites_menu')) {
    return;
  }

  const menu = await createMenu(await getSavedFavorites());
  const directoriesMenu = document.querySelector('.topnav > .twoline.parentitem.last');

  directoriesMenu.before(menu);
  addListeners();
  insertControlStyle();
}

export default registerModule('Favorites', favorites);
