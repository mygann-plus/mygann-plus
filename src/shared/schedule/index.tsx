import { UnloaderContext } from '~/core/module-loader';
import { isCurrentTime } from '~/utils/date';

import {
  createElement,
  addEventListener,
  waitForLoad,
  insertCss,
} from '~/utils/dom';
import DropdownMenu from '~/utils/dropdown-menu';
import log from '~/utils/log';
import runWithPodiumApp from '~/utils/podium-app';
import tick from '~/utils/tick';

import style from './style.css';

/* eslint-disable import/prefer-default-export */

export function getCurrentDay() {
  return document.querySelector('.chCal-header-space + h2').textContent.split(',')[0].trim();
}

// get the header that does not change when the day changes, useful for observing
export function getPermanentHeader() {
  return waitForLoad(() => document.querySelector('#col-main > div:nth-child(1)'));
}

export function isFaculty() {
  return window.location.hash === '#myday/schedule-performance';
}
function formatDay(dayString: string) {
  return Number(dayString).toString(); // remove leading "0"
}

export function hasParentWithClassName(element: HTMLElement, classnames: string[]): boolean {
  return !!classnames.find(classname => element.closest(`.${classname}`));
}

// tests if the current day on the schedule is set to today
export async function isCurrentDay() {
  const header = isFaculty()
    ? await waitForLoad(() => document.querySelector('#currentday h2'))
    : await waitForLoad(() => document.querySelector('#schedule-header h2'));

  const currentDate = header.textContent.split(', ')[1].split(' ');
  const [, month, day] = new Date().toDateString().split(' ');
  return currentDate[0].startsWith(month) && formatDay(currentDate[1]) === formatDay(day);
}

export function isEmptySchedule() {
  const scheduleHeader = document.querySelector('#col-main > div.ch.schedule-list > div');
  return (
    scheduleHeader && scheduleHeader.textContent === 'There is nothing scheduled for this date.'
  );
}

export function addDayChangeListener(callback: () => void) {
  const listener = (e: Event) => {
    if (hasParentWithClassName(e.target as HTMLElement, [
      'chCal-button-next', 'chCal-button-prev', 'chCal-button-today', 'chCal-button-today',
    ])) {
      callback();
    }
  };
  return addEventListener(document.body, 'click', listener);
}

export function addDayLoadedListener(callback: () => void, requireSchedule = true) {
  const scheduleContent = document.querySelector('#col-main > div.ch.schedule-list');
  if (!scheduleContent) log('warn', 'trying to observe schedule changes before schedule is loaded');
  const obs = new MutationObserver(mutationList => {
    for (let record of mutationList) {
      for (let node of record.addedNodes) {
        if (node instanceof HTMLTableElement
          || (!requireSchedule && node.textContent === 'There is nothing scheduled for this date.')) {
          // if it added the table or it added an empty schedule box and thats ok
          return callback();
        }
      }
    }
  });
  obs.observe(scheduleContent, { childList: true });
  return { remove() { obs.disconnect(); } };
}

export async function addAsyncDayLoadedListener(callback: () => void, requireSchedule = true) {
  await waitForLoad(() => document.getElementById('accordionSchedules') || isEmptySchedule()); // wait for a possibly empty schedule
  if (!requireSchedule || !isEmptySchedule()) callback();
  return addDayLoadedListener(callback, requireSchedule);
}

export function changeDate(date: Date | string) {
  runWithPodiumApp(({ p3 }, dateString) => {
    let Schedule = p3.module('schedule');
    Schedule.Data.DayViewDate = new Date(dateString);
    Schedule.Us.fetchScheduleData();
  }, date.toString());
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

export async function isCurrentClass(timeString: string) {
  const currentDay = await isCurrentDay();
  const dayView = await isDayView();
  const currentTime = isCurrentTime(timeString);
  return currentDay && dayView && currentTime;
}

export function getAnnouncementWrap() {
  return document.querySelector('#schedule-header .alert.alert-info') as HTMLElement;
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

interface AnnouncementDropdownItem {
  title: string;
  id: string; // human-readable ID, to prevent duplicate insertions
  onclick: () => void;
  shouldShow: () => boolean | Promise<boolean>;
}

const announcementDropdownItems: AnnouncementDropdownItem[] = [];

async function addDropdown(unloaderContext: UnloaderContext) {
  await tick(100);
  // TODO: what is this logic
  const banner = await waitForLoad(() => (
    isEmptySchedule() || document.querySelector('#schedule-header .alert-info') as HTMLElement
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
  (banner as HTMLElement).appendChild(announcementDropdown.getDropdownWrap());
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
export function insertAnnouncementDropdown(unloaderContext: UnloaderContext) {
  const existingDropdown = document.querySelector(`.${selectors.dropdownWrap}`);
  if (existingDropdown) {
    return;
  }
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
  addDropdown(unloaderContext);
  addDayChangeListener(() => addDropdown(unloaderContext));
}

/**
 *
 * @param {Object} link
 * @param {string} link.title
 * @param {function} link.onclick
 * @param {function} link.shouldShow
 */

// TODO: Maybe call this function registerAnnouncementDropdownItem for consistency?
export function registerAnnouncementDropdownLink(link: AnnouncementDropdownItem) {
  if (announcementDropdownItems.some(item => item.id === link.id)) {
    return;
  }
  announcementDropdown.addItem(link);
  announcementDropdownItems.push(link);
}
