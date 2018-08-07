import createModule from '~/utils/module';

import { waitForLoad, constructButton, insertCss } from '~/utils/dom';

import style from './style.css';

const selectors = {
  activeButton: style.locals['active-button'],
};

const completedStatusIndices = [
  4, // completed
  5, // graded
];

function isChecked(checkbox) {
  return checkbox.classList.contains('active');
}

async function onFilterStatusClick(hideCompletedButton) {
  const applyButton = await waitForLoad(() => document.querySelector('#btn-filter-apply'));
  const dialog = applyButton.closest('.modal-dialog');

  applyButton.addEventListener('click', () => {
    const checkboxes = dialog.querySelectorAll('.status-button');
    let allUnchecked = true;
    for (const index of completedStatusIndices) {
      allUnchecked = allUnchecked && !isChecked(checkboxes[index]);
    }
    hideCompletedButton.classList.toggle(selectors.activeButton, allUnchecked);
    hideCompletedButton.disabled = false;
  });
}

async function toggleHidden({ target: button }) {
  document.getElementById('filter-status').click();

  const hideDialogStyle = insertCss(`
    .modal-backdrop, .modal-dialog {
      display: none;
    }
  `);

  await waitForLoad(() => document.querySelector('.modal-dialog'));
  const dialog = document.querySelector('.modal-dialog');
  button.disabled = true;

  try {
    const checkboxes = dialog.querySelectorAll('.status-button');
    const desiredState = button.classList.contains(selectors.activeButton);

    for (const index of completedStatusIndices) {
      if (isChecked(checkboxes[index]) !== desiredState) {
        checkboxes[index].querySelector('.p3icon-check').click();
      }
    }

    dialog.querySelector('#btn-filter-apply').click();
  } finally {
    // reset modal style even if error occurs
    // failure to do so could break all other dialogs
    hideDialogStyle.remove();
  }
}

const domQuery = () => document.querySelector('#filter-status');

async function hideCompleted() {
  insertCss(style.toString());
  const filterStatusButton = await waitForLoad(domQuery);

  const button = constructButton('Hide Completed', '', 'fa fa-check', toggleHidden);
  filterStatusButton.parentNode.appendChild(button);
  filterStatusButton.addEventListener('click', () => onFilterStatusClick(button));
}
export default createModule('{6394e18f-5b51-44f4-bb3c-1144ab97945a}', {
  name: 'Hide Completed Assignments',
  main: hideCompleted,
});
