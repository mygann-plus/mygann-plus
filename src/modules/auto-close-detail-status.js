import { waitForLoad } from '../utils/dom';

const classnames = {
  DROPDOWN_BUTTON: 'indicator-field p3formWhite dropdown-toggle assignment-status-button',
  DROPDOWN_MENU: 'dropdown-menu',
};

const getDropdownButton = () => document.getElementsByClassName(classnames.DROPDOWN_BUTTON)[0];
const getDropdownMenu = () => document.getElementsByClassName(classnames.DROPDOWN_MENU)[0];

const showDropdownMenu = () => { getDropdownMenu().style.visibility = 'visible'; };
const hideDropdownMenu = () => { getDropdownMenu().style.visibility = 'hidden'; };

function attachListeners() {
  getDropdownButton().addEventListener('click', () => {
    showDropdownMenu();
    getDropdownMenu().addEventListener('click', e => {
      hideDropdownMenu();
      e.preventDefault();
    });
  });
  document.getElementById('app').addEventListener('click', hideDropdownMenu);
}

export default function() {
  waitForLoad(getDropdownButton).then(attachListeners);
}

