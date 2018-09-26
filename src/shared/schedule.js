import { addEventListener } from '~/utils/dom';

/* eslint-disable import/prefer-default-export */

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

export function isDayView() {
  return !!document.getElementById('accordionSchedules');
}
