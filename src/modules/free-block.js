import registerModule from '~/module';

import { createElement, waitForLoad } from '~/utils/dom';
import { addDayChangeListeners, to24Hr } from '~/shared/schedule';

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
  const createCell = (heading, content) => <td dataset={{ heading }}>{ content }</td>;

  const activity = <h4><a href="#studentmyday/schedule">Free</a></h4>;
  const contact = <span><span>N/A</span></span>;

  const tr = (
    <tr>
      { createCell('Time', `${addMinutes(startTime, 5)} - ${addMinutes(endTime, -5)}`) }
      { createCell('Block', 'Free Block') }
      { createCell('Activity', activity) }
      { createCell('Contact', contact)}
      { createCell('Details', '') }
      { createCell('Attendance', '') }
    </tr>
  );

  elemBefore.after(tr);

}

const domQuery = () => document.querySelector('#accordionSchedules > :first-child > *');

async function insertFreeBlock() {
  await waitForLoad(domQuery);
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
}

function freeBlock() {
  insertFreeBlock();
  addDayChangeListeners(insertFreeBlock);
}

export default registerModule('{5a1befbf-8fed-481d-8184-8db72ba22ad1}', {
  name: 'Show Free Blocks in Schedule',
  main: freeBlock,
});
