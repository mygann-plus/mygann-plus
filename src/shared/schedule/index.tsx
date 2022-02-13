import { UnloaderContext } from '~/core/module-loader';

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

  const currentDate = header.textContent.split(', ')[1];
  const d = new Date().toDateString();
  const month = d.split(' ')[1];
  const day = d.split(' ')[2];
  return currentDate.split(' ')[0].startsWith(month) && formatDay(currentDate.split(' ')[1]) === formatDay(day);
}

export function addDayChangeListeners(callback: () => void) {
  const listener = (e: Event) => {
    if (hasParentWithClassName(e.target as HTMLElement, [
      'chCal-button-next', 'chCal-button-prev', 'chCal-button-today', 'chCal-button-today',
    ])) {
      callback();
    }
  };
  return addEventListener(document.body, 'click', listener);
}

export function addDayTableLoadedListeners(callback: () => void) {
  const scheduleContent = document.querySelector('#col-main > div.ch.schedule-list');
  if (!scheduleContent) log('warn', 'trying to observe schedule changes before schedule is loaded');
  const obs = new MutationObserver(mutationList => {
    for (let record of mutationList) {
      const newSchedule = Array.from(record.addedNodes as NodeListOf<HTMLElement>).find(
        node => node instanceof HTMLTableElement || node.className === 'pl-10', // either a table or an empty schedule box
      );
      if (newSchedule) {
        return callback();
      }
    }
  });
  obs.observe(scheduleContent, { childList: true });
  return { remove() { obs.disconnect(); } };
}

export function changeDate(date: Date | string) {
  runWithPodiumApp(({ p3 }, dateString) => {
    let Schedule = p3.module('schedule');
    Schedule.Data.DayViewDate = new Date(dateString);
    Schedule.Us.fetchScheduleData();
  }, date.toString());
}

export function to24Hr(t: string) {
  const time = t;
  let hours = Number(time.match(/^(\d+)/)[1]);
  const minutes = Number(time.match(/:(\d+)/)[1]);
  const ampm = time.match(/\s(.*)$/)[1];
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours -= 12;
  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if (hours < 10) sHours = `0${sHours}`;
  if (minutes < 10) sMinutes = `0${sMinutes}`;
  return `${sHours}:${sMinutes}:00`;
}

function isBetween(start: string, end: string) {
  const startTime = start;
  const endTime = end;
  const currentDate = new Date();
  const startDate = new Date(currentDate.getTime());
  startDate.setHours(Number(startTime.split(':')[0]));
  startDate.setMinutes(Number(startTime.split(':')[1]));
  startDate.setSeconds(Number(startTime.split(':')[2]));
  const endDate = new Date(currentDate.getTime());
  endDate.setHours(Number(endTime.split(':')[0]));
  endDate.setMinutes(Number(endTime.split(':')[1]));
  endDate.setSeconds(Number(endTime.split(':')[2]));
  return startDate < currentDate && endDate > currentDate;
}

export function isCurrentTime(timeString: string) {
  const times = timeString.split('-').map(s => s.trim());
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
  const scheduleHeader = document.querySelector('#col-main > div.ch.schedule-list > div');
  return (
    scheduleHeader && scheduleHeader.textContent === 'There is nothing scheduled for this date.'
  );
}

export async function isCurrentClass(timeString: string) {
  const currentDay = await isCurrentDay();
  const dayView = await isDayView();
  const currentTime = isCurrentTime(timeString);
  return currentDay && dayView && currentTime;
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
  addDayChangeListeners(() => addDropdown(unloaderContext));
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
  if (announcementDropdownItems.find(item => item.id === link.id)) {
    return;
  }
  announcementDropdown.addItem(link);
  announcementDropdownItems.push(link);
}
