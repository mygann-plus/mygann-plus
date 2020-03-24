import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import {
  waitForLoad,
  constructButton,
  insertCss,
  addEventListener,
} from '~/utils/dom';

import { appendMobileAssignmentCenterMenuLink } from '~/shared/assignments-center';

import style from './style.css';
import { getHideCompletedEnabled, setHideCompletedEnabled } from './hide-completed-model';

const selectors = {
  activeButton: style.locals['active-button'],
};

const completedStatusIndices = [
  4, // completed
  5, // graded
];

function isChecked(checkbox: HTMLElement) {
  return checkbox.classList.contains('active');
}

async function runFilterDialog(fn: (dialog: HTMLElement) => void = () => {}) {
  document.getElementById('filter-status').click();

  const hideDialogStyle = insertCss(`
    .modal-backdrop, .modal-dialog {
      display: none;
    }
  `);

  await waitForLoad(() => document.querySelector('.modal-dialog'));
  const dialog = document.querySelector('.modal-dialog') as HTMLElement;
  try {
    await fn(dialog);
    (dialog.querySelector('#btn-filter-apply') as HTMLElement).click();
  } finally {
    // reset modal style even if error occurs
    // failure to do so could break all other dialogs
    hideDialogStyle.remove();
  }
}

async function onFilterStatusClick(hideCompletedButtons: HTMLElement[]) {
  const applyButton = await waitForLoad(() => document.querySelector('#btn-filter-apply'));
  const dialog = applyButton.closest('.modal-dialog');

  applyButton.addEventListener('click', () => {
    const checkboxes = dialog.querySelectorAll('.status-button');
    let allUnchecked = true;
    for (const index of completedStatusIndices) {
      allUnchecked = allUnchecked && !isChecked(checkboxes[index] as HTMLElement);
    }
    for (const button of hideCompletedButtons) {
      button.classList.toggle(selectors.activeButton, allUnchecked);
      if (button instanceof HTMLButtonElement) {
        button.disabled = false;
      }
    }
  });
}

async function toggleHidden(button: HTMLElement) {
  if (button instanceof HTMLButtonElement) {
    button.disabled = true;
  }

  const isHiddenEnabled = button.classList.contains(selectors.activeButton);
  const completedLabels = document.querySelectorAll('.label-success');

  if (isHiddenEnabled && completedLabels.length) {
    return runFilterDialog();
  }

  await runFilterDialog(dialog => {
    const checkboxes = dialog.querySelectorAll('.status-button');
    for (const index of completedStatusIndices) {
      if (isChecked(checkboxes[index] as HTMLElement) !== isHiddenEnabled) {
        (checkboxes[index].querySelector('.p3icon-check') as HTMLElement).click();
      }
    }
    setHideCompletedEnabled(!isHiddenEnabled);
  });
}

async function enableHidden(hideCompletedButtons: HTMLElement[]) {
  const isEnabled = hideCompletedButtons[0].classList.contains(selectors.activeButton);
  if (!isEnabled) {
    for (const button of hideCompletedButtons) {
      toggleHidden(button);
    }
  }
}

const domQuery = {
  desktop: () => document.querySelector('#filter-status'),
  mobile: () => document.querySelector('#filter-status-menu'),
};

async function hideCompleted(
  suboptions: HideCompletedSuboptions,
  unloaderContext: UnloaderContext,
) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await waitForLoad(() => domQuery.desktop() && domQuery.mobile());

  const filterStatusButton = domQuery.desktop();
  const filterStatusLink = domQuery.mobile();

  const button = constructButton({
    textContent: 'Hide Completed',
    iClassName: 'fa fa- check',
    onClick: (e: Event) => {
      toggleHidden(e.target as HTMLButtonElement);
    },
  });
  filterStatusButton.parentNode.appendChild(button);
  unloaderContext.addRemovable(button);

  const mobileLink = appendMobileAssignmentCenterMenuLink('Hide Completed', (e: Event) => {
    toggleHidden(e.target as HTMLElement);
  }, 0);
  unloaderContext.addRemovable(mobileLink);

  const handleFilterStatus = () => onFilterStatusClick([button, mobileLink]);
  const desktopFilterStatusListener = addEventListener(
    filterStatusButton,
    'click',
    handleFilterStatus,
  );
  const mobileFilterStatusListener = addEventListener(
    filterStatusLink,
    'click',
    handleFilterStatus,
  );
  unloaderContext.addRemovable(desktopFilterStatusListener);
  unloaderContext.addRemovable(mobileFilterStatusListener);

  // if persisting and enabled in storage, turn on
  if (suboptions.persist && await getHideCompletedEnabled()) {
    enableHidden([button, mobileLink]);
  } else {
    // open and apply dialog, which updates button to current filter
    // used for dynamic loading
    runFilterDialog(() => {});
  }
}

interface HideCompletedSuboptions {
  persist: boolean;
}

export default registerModule('{6394e18f-5b51-44f4-bb3c-1144ab97945a}', {
  name: 'Hide Completed Assignments Button',
  description: 'Button to quickly show or hide completed and graded assignments',
  main: hideCompleted,
  suboptions: {
    persist: {
      name: 'Keep Enabled',
      type: 'boolean',
      defaultValue: false,
    },
  },
});
