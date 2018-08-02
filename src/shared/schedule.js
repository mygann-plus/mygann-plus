import { hasParentWithClassName } from '../utils/dom';

/* eslint-disable import/prefer-default-export */

function formatDay(dayString) {
  return Number(dayString).toString(); // remove leading "0"
}

// tests if the current day on the schedule is set to today + daysFromNow
export function isCurrentDay() {
  const cur = document.getElementById('schedule-header')
    .children[0].children[0].children[0].children[1].children[0].children[3]
    .textContent.split(', ')[1];
  const d = new Date().toDateString();
  let month = d.split(' ')[1];
  let day = d.split(' ')[2];
  return cur.split(' ')[0].startsWith(month) && cur.split(' ')[1] === formatDay(day);
}

export function addDayChangeListeners(callback) {
  document.body.addEventListener('click', e => {
    if (hasParentWithClassName(e.target, [
      'chCal-button-next', 'chCal-button-prev', 'chCal-button-today', 'chCal-button-today',
    ])) {
      callback();
    }
  });
}
