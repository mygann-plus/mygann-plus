import registerModule from '~/utils/module';

import { waitForLoad } from '~/utils/dom';
import { addDayChangeListeners } from '~/shared/schedule';

const DOM_QUERY = () => {
  return document.getElementById('accordionSchedules')
        && document.getElementById('accordionSchedules').children[0]
        && document.getElementById('accordionSchedules').children[0].children
        && document.getElementById('accordionSchedules').children[0].children.length;
};

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

// start and end must be 24HR format
function isConsecutive(start, end) {

  const DISTANCE = 30;

  const startHour = start.split(':')[0];
  const endHour = end.split(':')[0];
  const startMinute = start.split(':')[1];
  const endMinute = end.split(':')[1];

  if (startHour !== endHour) {
    if (Number(startMinute) + DISTANCE >= 60) {
      return ((Number(startMinute) + DISTANCE) - 60) >= Number(endMinute);
    }
    return false;
  }
  if (Number(startMinute) + DISTANCE >= Number(endMinute)) {
    return true;
  }
  return false;
}
window.isConsecutive = isConsecutive;

function addMinutes(time, mins) {
  const padNumber = m => (String(m).length === 1 ? `0${m}` : m);
  const t = time.split(' ')[0];
  const hours = t.split(':')[0];
  const minutes = t.split(':')[1];
  if (Number(minutes) + mins >= 60) {
    // seconds will always be 00
    return `${Number(hours) + Math.floor(mins / 60)}:${padNumber(Math.abs(60 - (Number(minutes) + Number(mins))))} ${time.split(' ')[1]}`;
  }
  if ((Number(minutes) + mins) <= 0) {
    return `${Number(hours) + Math.floor(mins / 60)}:${padNumber(60 + (Number(minutes) + Number(mins)))} ${time.split(' ')[1]}`;
  }
  return `${hours}:${padNumber(Number(minutes) + mins)} ${time.split(' ')[1]}`;
}

function insertBlock(elemBefore, startTime, endTime) {
  const tr = document.createElement('tr');
  const time = document.createElement('td');
  const block = document.createElement('td');
  const activity = document.createElement('td');
  const contact = document.createElement('td');
  const details = document.createElement('td');
  const attendance = document.createElement('td');

  tr.setAttribute('data-index', 0);
  time.setAttribute('data-heading', 'Time');
  block.setAttribute('data-heading', 'Block');
  activity.setAttribute('data-heading', 'Activity');
  contact.setAttribute('data-heading', 'Contact');
  details.setAttribute('data-heading', 'Details');
  attendance.setAttribute('data-heading', 'Attendance');

  tr.className = 'oes_freeblock_block';
  time.innerHTML = `${addMinutes(startTime, 5)} - ${addMinutes(endTime, -5)}`;
  block.innerHTML = 'Free Block';
  activity.innerHTML = '<h4><a href="#studentmyday/schedule">Free</a></h4>';
  attendance.innerHTML = '<span><span class="">N/A</span></span>';

  tr.appendChild(time);
  tr.appendChild(block);
  tr.appendChild(activity);
  tr.appendChild(contact);
  tr.appendChild(details);
  tr.appendChild(attendance);

  elemBefore.after(tr);
}

function insertFreeBlock() {
  waitForLoad(DOM_QUERY)
    .then(() => {
      const blocks = Array.from(document.getElementById('accordionSchedules').children);
      blocks.forEach((elem, i) => {
        const time = elem.children[0].childNodes[0].data.trim();
        const endTime = time.split('-')[1].trim();

        if (blocks[i + 1]) {
          const nextTime = blocks[i + 1].children[0].childNodes[0].data.trim();
          const nextStartTime = nextTime.split('-')[0].trim();

          if (!(isConsecutive(to24Hr(endTime), to24Hr(nextStartTime)))) {
            insertBlock(elem, endTime, nextStartTime);
            setTimeout(() => {
              if (document.getElementsByClassName('oes_freeblock_block') === 0) {
                insertFreeBlock();
              }
            }, 100);
          }
        }
      });
    });
}

function freeBlock() {
  insertFreeBlock();
  addDayChangeListeners(insertFreeBlock);
}

export default registerModule('Show Free Blocks in Schedule', freeBlock);
