import createModule from '~/utils/module';
import { waitForLoad, insertCss } from '~/utils/dom';

import { createMenu, setMenuList } from './favorites-ui';
import { getSavedFavorites, addFavoritesChangeListener } from './favorites-model';

import style from './style.css';

async function initFavorites(opts, unloaderContext) {
  await waitForLoad(() => document.querySelector('.topnav > .twoline.parentitem.last'));
  const menu = await createMenu();
  const directoriesMenu = document.querySelector('.topnav > .twoline.parentitem.last');

  directoriesMenu.before(menu);
  unloaderContext.addRemovable(menu);

  setMenuList(menu, await getSavedFavorites());
  const favoritesChangeListener = addFavoritesChangeListener(({ newValue }) => {
    setMenuList(menu, newValue);
  });
  unloaderContext.addRemovable(favoritesChangeListener);

  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
}

export default createModule('{a98c8f19-a6fc-449a-bc03-ca9dc0cc7550}', {
  name: 'Favorites',
  init: initFavorites,
});
