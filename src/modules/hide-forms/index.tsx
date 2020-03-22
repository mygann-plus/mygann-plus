import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, constructButton, insertCss } from '~/utils/dom';
import { getUserId } from '~/utils/user';
import { fetchApi } from '~/utils/fetch';
import tick from '~/utils/tick';

import {
  addHiddenForm,
  getHiddenForms,
  deleteHiddenForm,
  addHiddenFormsChangeListener,
} from './hide-forms-model';

import style from './style.css';

const selectors = {
  hideButton: style.locals['hide-button'],
  hideButtonActive: style.locals.active,
};

function getFormControls(formRow: HTMLElement) {
  return formRow.querySelector('h4.pull-right');
}
function getFormId(formRow: HTMLElement) {
  return parseInt(
    getFormControls(formRow).querySelector('button').dataset.downloadlink
      .split('#schoolform/')[1]
      .split('/keyid')[0],
    10,
  );
}
function isFormCompleted(formRow: Element) {
  return !!formRow.querySelector('.btn-success');
}

class HideButton {

  private formRow: HTMLElement;
  private button: HTMLElement;
  private id: number;
  private isActive: boolean;

  constructor(formRow: HTMLElement, hiddenForms: any[]) {
    this.formRow = formRow;
    this.id = getFormId(formRow);
    this.isActive = hiddenForms.includes(this.id);
    this.button = this.generateButton();
  }

  show() {
    getFormControls(this.formRow).appendChild(this.button);
  }

  generateButton() {
    const hideButton = constructButton(
      'Hide', '', 'fa fa-eye-slash',
      e => this.handleButtonClick(e),
      classNames(selectors.hideButton, this.isActive && selectors.hideButtonActive),
    );
    hideButton.classList.remove('btn-sm');
    return hideButton;
  }

  handleButtonClick(e: Event) {
    e.stopPropagation();
    this.button.classList.toggle(selectors.hideButtonActive);
    this.button.blur();
    if (this.isActive) {
      deleteHiddenForm(this.id);
    } else {
      addHiddenForm(this.id);
    }
    this.isActive = !this.isActive;
  }

  remove() {
    this.button.remove();
  }
}

// banner hider
async function getActiveForms() {
  const userId = await getUserId();
  const endpoint = `/api/DataDirect/GetMyFileForms?userId=${userId}`;
  const forms = await fetchApi(endpoint);
  return forms
    .filter((form: any) => form.ReviewInd !== 2) // is not completed
    .map((form: any) => form.ApplicationFormId); // get id
}

async function updateBanner(
  banner: HTMLElement,
  activeForms: any[],
  hiddenForms: any[],
) {
  await waitForLoad(() => banner.querySelector('[data-bulletintype]:not([data-bulletintype=""])'));
  const bulletins = banner.querySelectorAll('[data-bulletintype]:not([data-bulletintype=""])');
  if (Array.from(bulletins).some((b: HTMLElement) => b.dataset.bulletintype !== 'Form')) {
    // non-form bulletins, e.g. snow day alerts
    return;
  }
  banner.style.display = 'none';
  try {
    const activeHiddenForms = activeForms.filter(form => hiddenForms.includes(form));
    const activeUnhiddenFormsCount = activeForms.length - activeHiddenForms.length;
    const bannerFormsLink = banner.querySelector('a[href="#myfiles"]');
    if (activeUnhiddenFormsCount > 0) {
      bannerFormsLink.textContent = `${activeUnhiddenFormsCount} Form(s) to Review`;
      banner.style.display = 'block';
    }
  } catch (e) {
    banner.style.display = 'block';
  }
}

const domQuery = {
  formsWrap: () => document.querySelector('#my-files-content-container'),
  formTable: () => document.querySelector('.table tr'),
  banner: () => document.querySelector('#main-bulletin') as HTMLElement,
};

// add hide form ui to forms page
async function addHideButtons(unloaderContext: UnloaderContext) {
  await waitForLoad(domQuery.formTable);
  await tick();
  const formRows = document.querySelectorAll('.table tr');
  const hiddenForms = await getHiddenForms();
  for (const formRow of formRows) {
    if (isFormCompleted(formRow)) {
      continue;
    }
    const hideButton = new HideButton(formRow as HTMLElement, hiddenForms);
    hideButton.show();
    unloaderContext.addRemovable(hideButton);
  }
}

async function hideFormsMain(opts: void, unloaderContext: UnloaderContext) {
  if (window.location.hash !== '#myfiles') {
    return;
  }

  addHideButtons(unloaderContext);
  const formsWrap = await waitForLoad(domQuery.formsWrap);
  const observer = new MutationObserver(() => addHideButtons(unloaderContext));
  observer.observe(formsWrap, {
    childList: true,
  });
}

// globally decrement the form banner
async function initHideForms(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
  const banner = await waitForLoad(domQuery.banner);
  const hiddenForms = await getHiddenForms();
  const activeForms = await getActiveForms();
  updateBanner(banner, activeForms, hiddenForms);
  const hiddenFormsChangeListener = addHiddenFormsChangeListener(({ newValue }) => {
    updateBanner(banner, activeForms, newValue);
  });
  unloaderContext.addRemovable(hiddenFormsChangeListener);
}

async function unloadHideForms() {
  const banner = await waitForLoad(domQuery.banner);
  const activeForms = await getActiveForms();
  updateBanner(banner, activeForms, []);
}

export default registerModule('{134543a9-7e9e-4257-86b9-a8aa85a85157}', {
  name: 'Hide Forms',
  description: 'Permanently hide individual forms',
  init: initHideForms,
  main: hideFormsMain,
  unload: unloadHideForms,
});
