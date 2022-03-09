import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import { addEventListener, waitForLoad } from '~/utils/dom';

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
  return addEventListener(document.getElementById('app'), 'click', hideDropdownMenu);
}

function autoCloseDetailStatusMain(opts: void, unloaderContext: UnloaderContext) {
  waitForLoad(getDropdownButton).then(attachListeners).then(unloaderContext.addRemovable);
}

export default registerModule('{1020164f-8a6e-4bb0-aac8-d5acf0e5ad72}', {
  name: 'fix.autoCloseDetailStatus',
  main: autoCloseDetailStatusMain,
  showInOptions: false,
  affectsGlobalState: true,
});
