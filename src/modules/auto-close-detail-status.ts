import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

const classnames = {
  DROPDOWN_BUTTON: 'indicator-field p3formWhite dropdown-toggle assignment-status-button',
  DROPDOWN_MENU: 'dropdown-menu',
};

const getDropdownButton = () => {
  return document.getElementsByClassName(classnames.DROPDOWN_BUTTON)[0] as HTMLElement;
};
const getDropdownMenu = () => {
  return document.getElementsByClassName(classnames.DROPDOWN_MENU)[0] as HTMLElement;
};

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

function autoCloseDetailStatusMain() {
  waitForLoad(getDropdownButton).then(attachListeners);
}

export default registerModule('{1020164f-8a6e-4bb0-aac8-d5acf0e5ad72}', {
  name: 'Auto Close Detail Status',
  main: autoCloseDetailStatusMain,
  showInOptions: false,
});
