import { locals } from './style.css';

const selectors = {
  dialog: {
    title: 'gocp_favorites_form-title',
    hash: 'gocp_favorites_form-hash',
  },
  controls: locals.controls,
  addButton: 'gocp_favorites_addbutton',

  menuItem: {
    link: locals['menu-link'],
    desktopLink: locals['menu-desktop-link'],
    mobileLink: locals['menu-mobile-link'],
    title: 'gocp_favorites_menu-title',
    highlight: locals['menu-highlight'],
  },
  menu: 'gocp_favorites_menu',
  visibleMenu: locals['visible-menu'],
  dropdown: 'gocp_favorites_dropdown',
  mobileMenu: {
    submenu: locals['mobile-menu-submenu'],
    arrow: locals['mobile-menu-arrow'],
    dropdown: 'gocp_favorites_mobile-dropdown',
  },
};

export default selectors;
