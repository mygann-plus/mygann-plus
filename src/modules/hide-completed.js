import registerModule from '../utils/module';

import { waitForLoad, constructButton, insertCss } from '../utils/dom';
import colors from '../utils/colors';

const selectors = {
  activeButton: 'gocp_hide-completed_active-button',
};


async function toggleHidden({ target: button }) {
  document.getElementById('filter-status').click();

  const hideDialogStyle = insertCss(`
    .modal-backdrop, .modal-dialog {
      display: none;
    }
  `);

  await waitForLoad(() => document.querySelector('.modal-dialog'));
  const dialog = document.querySelector('.modal-dialog');

  try {
    const checkboxes = dialog.querySelectorAll('.p3icon-check');
    checkboxes[4].click(); // completed
    checkboxes[5].click(); // graded
    dialog.querySelector('#btn-filter-apply').click();
  } finally {
    // reset modal style even if error occurs
    // failure to do so could break all other dialogs
    hideDialogStyle.remove();
  }


  button.classList.toggle(selectors.activeButton);
}

const domQuery = () => document.querySelector('.assignment-calendar-button-bar');

function addStyles() {
  insertCss(`
    .${selectors.activeButton} {
      color: white !important;
      background: ${colors.successGreen} !important;
    }
  `);
}

async function hideCompleted() {
  await waitForLoad(domQuery);
  addStyles();

  const button = constructButton('Hide Completed', '', 'fa fa-check', toggleHidden);
  domQuery().appendChild(button);
}
export default registerModule('Hide Completed Assignments', hideCompleted);
