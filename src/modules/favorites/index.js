import registerModule from '~/module';
import { waitForLoad, insertCss } from '~/utils/dom';

import { createDesktopMenu, setDesktopMenuList } from './favorites-desktop';
import { createMobileMenu, setMobileMenuList } from './favorites-mobile';
import { getSavedFavorites, addFavoritesChangeListener } from './favorites-model';

import style from './style.css';

const domQueries = {
  desktop: () => document.querySelector('.topnav > .twoline.parentitem.last'),
  mobile: () => document.querySelector('#site-mobile-sitenav .clearfix:nth-child(7)'),
};

async function initFavorites(opts, unloaderContext) {
  await waitForLoad(() => domQueries.desktop() && domQueries.mobile());

  const desktopMenu = createDesktopMenu();
  const desktopDirectoriesMenu = domQueries.desktop();
  desktopDirectoriesMenu.before(desktopMenu);
  unloaderContext.addRemovable(desktopMenu);
  setDesktopMenuList(desktopMenu, await getSavedFavorites());

  const mobileMenu = createMobileMenu();
  const mobileDirectoriesMenu = domQueries.mobile();
  mobileDirectoriesMenu.before(mobileMenu);
  unloaderContext.addRemovable(mobileMenu);
  setMobileMenuList(mobileMenu, await getSavedFavorites());

  const favoritesChangeListener = addFavoritesChangeListener(({ newValue }) => {
    setDesktopMenuList(desktopMenu, newValue);
    setMobileMenuList(mobileMenu, newValue);
  });
  unloaderContext.addRemovable(favoritesChangeListener);

  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
}

export default registerModule('{a98c8f19-a6fc-449a-bc03-ca9dc0cc7550}', {
  name: 'Favorites',
  init: initFavorites,
  defaultEnabled: false,
});
