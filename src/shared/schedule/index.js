import {
  createElement,
  addEventListener,
  waitForLoad,
  insertCss,
} from '~/utils/dom';
import DropdownMenu from '~/utils/dropdown-menu';
import tick from '~/utils/tick';

import style from './style.css';

/* eslint-disable import/prefer-default-export */

export function getCurrentDay() {
  return document.querySelector('.chCal-header-space + h2').textContent.split(',')[0].trim();
}

export function isFaculty() {
  return window.location.hash === '#myday/schedule-performance';
}
function formatDay(dayString) {
  return Number(dayString).toString(); // remove leading "0"
}

export function hasParentWithClassName(element, classnames) {
  const containsClass = c => element.className.split(' ').indexOf(c) >= 0;
  if (element.className && classnames.filter(containsClass).length > 0) {
    return true;
  }
  return element.parentNode && hasParentWithClassName(element.parentNode, classnames);
}

// tests if the current day on the schedule is set to today
export async function isCurrentDay() {
  const header = isFaculty()
    ? await waitForLoad(() => document.querySelector('#currentday h2'))
    : await waitForLoad(() => document.querySelector('#schedule-header h2'));

  const currentDate = header.textContent.split(', ')[1];
  const d = new Date().toDateString();
  const month = d.split(' ')[1];
  const day = d.split(' ')[2];
  return currentDate.split(' ')[0].startsWith(month) && formatDay(currentDate.split(' ')[1]) === formatDay(day);
}

export function addDayChangeListeners(callback) {
  const listener = e => {
    if (hasParentWithClassName(e.target, [
      'chCal-button-next', 'chCal-button-prev', 'chCal-button-today', 'chCal-button-today',
    ])) {
      callback();
    }
  };
  return addEventListener(document.body, 'click', listener);
}

export function to24Hr(t) {
  let time = t;
  let hours = Number(time.match(/^(\d+)/)[1]);
  let minutes = Number(time.match(/:(\d+)/)[1]);
  let AMPM = time.match(/\s(.*)$/)[1];
  if (AMPM === 'PM' && hours < 12) hours += 12;
  if (AMPM === 'AM' && hours === 12) hours -= 12;
  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if (hours < 10) sHours = `0${sHours}`;
  if (minutes < 10) sMinutes = `0${sMinutes}`;
  return `${sHours}:${sMinutes}:00`;
}

function isBetween(start, end) {
  const startTime = start;
  const endTime = end;
  const currentDate = new Date();
  const startDate = new Date(currentDate.getTime());
  startDate.setHours(startTime.split(':')[0]);
  startDate.setMinutes(startTime.split(':')[1]);
  startDate.setSeconds(startTime.split(':')[2]);
  const endDate = new Date(currentDate.getTime());
  endDate.setHours(endTime.split(':')[0]);
  endDate.setMinutes(endTime.split(':')[1]);
  endDate.setSeconds(endTime.split(':')[2]);
  return startDate < currentDate && endDate > currentDate;
}

export function isCurrentTime(timeString) {
  const times = timeString.split('-').map(s => s.trim().split()).map(l => l[0]);
  return isBetween(to24Hr(times[0]), to24Hr(times[1]));
}

export async function isDayView() {
  if (isFaculty()) {
    const todayBtn = await waitForLoad(() => document.querySelector('.chCal-button-today'));
    return todayBtn.classList.contains('chCal-state-disabled');
  } else {
    return !!document.getElementById('accordionSchedules');
  }
}

export async function getDayViewDateString() {
  const dateHeader = await waitForLoad(() => document.querySelector('.chCal-header-space + h2'));
  return dateHeader.textContent;
}

export function isEmptySchedule() {
  return document.getElementsByClassName('pl-10')[0]
  && document.getElementsByClassName('pl-10')[0].textContent === 'There is nothing scheduled for this date.';
}

export async function isCurrentClass(timeString) {
  return (await isDayView()) && (isCurrentTime(timeString)) && (await isCurrentDay());
}

export function getAnnouncementWrap() {
  return document.querySelector('#schedule-header .alert.alert-info');
}
export function createAnnouncementWrap() {
  const alertBox = (
    <div className="alert alert-info" style={{ marginTop: '10px' }}>
    </div>
  );
  document.getElementsByClassName('col-md-12')[3].children[1].appendChild(alertBox);
  return alertBox;
}

// ANNOUNCEMENT DROPDOWN

const selectors = {
  dropdownWrap: style.locals['dropdown-wrap'],
  dropdownButton: style.locals['dropdown-button'],
};

const announcementDropdown = new DropdownMenu([], {
  wrapClassname: selectors.dropdownWrap,
  buttonClassname: selectors.dropdownButton,
});
const announcementDropdownItems = [];

async function addDropdown(unloaderContext) {
  await tick(100);
  const banner = await waitForLoad(() => (
    isEmptySchedule() || document.querySelector('#schedule-header .alert-info')
  ));
  if (!banner) {
    return;
  }
  announcementDropdown.clearItems();
  let shownItemCount = 0;
  for (const item of announcementDropdownItems) {
    if (await item.shouldShow()) {
      announcementDropdown.addItem(item);
      shownItemCount++;
    }
  }
  if (!shownItemCount) {
    return;
  }
  banner.appendChild(announcementDropdown.getDropdownWrap());
  unloaderContext.addRemovable(announcementDropdown.getDropdownWrap());

  const recheck = () => {
    if (!document.body.contains(announcementDropdown.getDropdownWrap())) {
      addDropdown(unloaderContext);
    }
  };

  setTimeout(recheck, 100);
  setTimeout(recheck, 500);
  setTimeout(recheck, 1000);
}

/**
 * Inserts dropdown button, or does nothing if dropdown already exists
*/
export function insertAnnouncementDropdown(unloaderContext) {
  const existingDropdown = document.querySelector(`.${selectors.dropdownWrap}`);
  if (existingDropdown) {
    return;
  }
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
  addDropdown(unloaderContext);
  addDayChangeListeners(() => addDropdown(unloaderContext));
}

/**
 *
 * @param {Object} link
 * @param {string} link.title
 * @param {function} link.onclick
 * @param {function} link.shouldShow
 */
export function registerAnnouncementDropdownLink(link) {
  if (announcementDropdownItems.find(item => item.id === link.id)) {
    return;
  }
  announcementDropdown.addItem(link);
  announcementDropdownItems.push(link);
}
