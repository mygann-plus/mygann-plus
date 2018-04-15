import { waitForLoad, nodeListToArray, hasParentWithClassName } from '../utils/dom';

// TIME & DATE CHECKERS

function to24Hr(t) {
  let time = t;
  let hours = Number(time.match(/^(\d+)/)[1]);
  let minutes = Number(time.match(/:(\d+)/)[1]);
  let AMPM = time.match(/\s(.*)$/)[1];
  if (AMPM == 'PM' && hours < 12) hours += 12; // eslint-disable-line eqeqeq
  if (AMPM == 'AM' && hours == 12) hours -= 12; // eslint-disable-line eqeqeq
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
function isCurrentTime(timeString) {
  const times = timeString.split('-').map(s => s.trim().split()).map(l => l[0]);
  return isBetween(to24Hr(times[0]), to24Hr(times[1]));
}
function isCurrentDay() { // the current page on the schedule is set to the current day
  const cur = document.getElementById('schedule-header')
    .children[0].children[0].children[0].children[1].children[0].children[3]
    .innerText.split(', ')[1];
  const d = new Date().toDateString();
  let month = d.split(' ')[1];
  let day = d.split(' ')[2];
  return cur.split(' ')[0].startsWith(month) && cur.split(' ')[1] === day;
}
function isCorrectFormat() { // is on day view, not month or week
  return !!document.getElementById('accordionSchedules');
}
function isCurrentClass(timeString) {
  return isCorrectFormat() && isCurrentTime(timeString) && isCurrentDay();
}
function hourStringToDate(time) {
  const endDate = new Date();
  endDate.setHours(time.split(':')[0]);
  endDate.setMinutes(time.split(':')[1]);
  endDate.setSeconds(time.split(':')[2]);
  return endDate;
}
function minutesTo(date) {
  let diffMs = (hourStringToDate(to24Hr(date)) - new Date());
  return Math.round(((diffMs % 86400000) % 3600000) / 60000);
}

function addTime(minutes, parent) {
  const br = document.createElement('br');
  const span = document.createElement('span');

  span.style.color = 'grey';
  span.style.display = 'inline-block';
  span.style.marginTop = '10px';
  span.innerText = `${minutes} minutes left`;
  parent.appendChild(br);
  parent.appendChild(span);
}

function testForClass() {

  const DOM_QUERY = () => {
    return document.getElementById('accordionSchedules')
          && document.getElementById('accordionSchedules').children[0]
          && document.getElementById('accordionSchedules').children[0].children
          && document.getElementById('accordionSchedules').children[0].children.length;
  };

  waitForLoad(DOM_QUERY)
    .then(() => {
      nodeListToArray(document.getElementById('accordionSchedules').children).forEach(c => {
        const timeString = c.children[0].childNodes[0].data.trim();
        if (isCurrentClass(timeString)) {
          const minutes = minutesTo(timeString.split('-')[1].trim());
          addTime(minutes, c.children[0]);
          setTimeout(() => {
            if (!document.body.contains(c)) {
              testForClass();
            }
          }, 50);
        }
      });
    });

}

function addDayChangeListeners() {
  document.body.addEventListener('click', e => {
    if (hasParentWithClassName(e.target, ['chCal-button-next', 'chCal-button-prev'])) {
      testForClass();
    }
  });
}

export default function classEndingTime() {
  testForClass();
  addDayChangeListeners();
}
