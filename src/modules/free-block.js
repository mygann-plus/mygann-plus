import registerModule from '~/module';

import { createElement, waitForLoad } from '~/utils/dom';
import { compareDate, timeStringToDate } from '~/utils/date';

import { addDayChangeListeners, to24Hr } from '~/shared/schedule';
import { getTableRowColumnContent } from '~/shared/table';

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

function insertBlock(elemBefore, startTime, endTime, blockText) {
  const createCell = (heading, content) => <td dataset={{ heading }}>{ content }</td>;

  const activity = <h4><a href="#studentmyday/schedule">Free</a></h4>;
  const attendance = <span><span>N/A</span></span>;

  const tr = (
    <tr>
      { createCell('Time', `${addMinutes(startTime, 5)} - ${addMinutes(endTime, -5)}`) }
      { createCell('Block', blockText) }
      { createCell('Activity', activity) }
      { createCell('Contact', '')}
      { createCell('Details', '') }
      { createCell('Attendance', attendance) }
    </tr>
  );

  elemBefore.after(tr);
  return tr;
}

// returns "A" or "B" depending on day of week
function getEndBlock() {
  const day = document.querySelector('.chCal-header-space + h2').textContent.trim();
  if (day === 'Monday' || day === 'Wednesday') {
    return 'A';
  } else {
    return 'B';
  }
}

const domQuery = () => document.querySelector('#accordionSchedules > :first-child > *');

async function insertFreeBlock(options, unloaderContext) {
  await waitForLoad(domQuery);
  const blocks = Array.from(document.getElementById('accordionSchedules').children);
  blocks.forEach((elem, i) => {
    const time = elem.children[0].childNodes[0].data.trim();
    const endTime = time.split('-')[1].trim();

    if (blocks[i + 1]) {
      const nextTime = blocks[i + 1].children[0].childNodes[0].data.trim();
      const nextStartTime = nextTime.split('-')[0].trim();

      const fullEndTime = to24Hr(endTime);
      const fullNextStartTime = to24Hr(nextStartTime);
      const endDate = timeStringToDate(fullEndTime);
      const nextStartDate = timeStringToDate(fullNextStartTime);

      // this catches two blocks overlapping, e.g. during Tuesday advisory lunch
      const isOverlap = compareDate(endDate, nextStartDate) > 0;

      if (!isConsecutive(fullEndTime, fullNextStartTime) && !isOverlap) {
        const block = insertBlock(elem, endTime, nextStartTime, 'Free Block');
        unloaderContext.addRemovable(block);


        setTimeout(() => {
          if (!document.body.contains(block)) {
            insertFreeBlock(options, unloaderContext);
          }
        }, 50);
      }
    } else if (options.showEndBlocks) {
      // special case for A/B block
      const blockText = getTableRowColumnContent(blocks[i], 'Block');
      if (blockText === 'Mincha') {
        const insertedBlock = insertBlock(elem, '3:55 PM', '5:05 PM', `${getEndBlock()} Block`);
        unloaderContext.addRemovable(insertedBlock);
      }
    }
  });
}

function freeBlock(options, unloaderContext) {
  insertFreeBlock(options, unloaderContext);

  const dayChangeListener = addDayChangeListeners(() => insertFreeBlock(options, unloaderContext));
  unloaderContext.addRemovable(dayChangeListener);
}

export default registerModule('{5a1befbf-8fed-481d-8184-8db72ba22ad1}', {
  name: 'Show Free Blocks in Schedule',
  main: freeBlock,
  suboptions: {
    showEndBlocks: {
      name: 'Show Free A/B Blocks',
      type: 'boolean',
      defaultValue: true,
    },
  },
});
