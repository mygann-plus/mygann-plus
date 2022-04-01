import { createElement, constructButton } from '~/utils/dom';
import tick from '~/utils/tick';
import { addAsyncDayLoadedListener } from '~/shared/schedule';

import style from './style.css';

const selectors = {
  button: style.locals['cancel-class-btn'],
  explode: style.locals.explode,
  message: style.locals['cancel-class-message'],
};

const domQuery = () => document.querySelectorAll('[data-heading="Attendance"]');

async function handleCancelClick(e: Event) {
  const button = e.target as HTMLButtonElement;
  button.textContent = 'Canceling Class...';
  button.classList.add(selectors.explode);
  await tick(800);
  const message = <span className={selectors.message}>April Fools!</span>;
  button.replaceWith(message);
}

async function insertCancelButtons() {
  const attendanceCols = domQuery();
  if (document.querySelector(`.${selectors.button}`)) {
    return;
  }
  for (const col of attendanceCols) {
    const button = constructButton({
      textContent: 'Cancel Class',
      onClick: handleCancelClick,
      className: selectors.button,
    });
    col.appendChild(button);
  }
}

export default function cancelClass() {
  addAsyncDayLoadedListener(insertCancelButtons);
}
