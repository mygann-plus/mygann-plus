import { locals } from './style.css';

const selectors = {
  dialog: {
    title: 'gocp_favorites_form-title',
    hash: 'gocp_favorites_form-hash',
  },
  control: {
    wrap: locals.controls,
    delete: 'gocp_favorites_delete-control',
    edit: 'gocp_favorites_edit-control',
  },
  addButton: 'gocp_favorites_addbutton',
  menuItem: {
    link: locals['menu-link'],
    title: 'gocp_favorites_menu-title',
  },
  menu: 'gocp_favorites_menu',
  visibleMenu: locals['visible-menu'],
  dropdown: 'gocp_favorites_dropdown',
};

export default selectors;
