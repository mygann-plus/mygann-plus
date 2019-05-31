import registerModule from '~/module';

import { createElement, insertCss, waitForOne } from '~/utils/dom';
import {
  compareDate,
  timeStringToDate,
  isDaylightSavings,
  dateTo12HrTimeString,
} from '~/utils/date';

import { addDayChangeListeners, to24Hr, isEmptySchedule, getCurrentDay } from '~/shared/schedule';
import { getTableRowColumnContent } from '~/shared/table';

import style from './style.css';
import { getBlockLetter, getEndBlockLetter, getBlockSchedule } from './block-letter';

const selectors = {
  activity: style.locals.activity,
  block: 'gocp_free-block_block',
};

// start and end must be 24HR format
function isConsecutive(start, end) {
  const startTime = new Date(`1/1/2000 ${start}`);
  const endTime = new Date(`1/1/2000 ${end}`);
  const difference = endTime.getTime() - startTime.getTime(); // difference in milliseconds
  const minuteDifference = Math.round(difference / 60000);
  return minuteDifference >= 0 && minuteDifference < 30;
}

/**
 * @param {string} time 24HR time string
 * @param {number} mins
 * @returns {string} 12HR time string
 */
function addMinutes(time, mins) {
  const newDate = new Date(timeStringToDate(time).getTime() + (mins * 60000));
  return dateTo12HrTimeString(newDate);
}

function insertBlock(elemBefore, startTime, endTime, blockText) {
  const createCell = (heading, content) => <td dataset={{ heading }}>{ content }</td>;

  const activity = <h4 className={selectors.activity}>Free</h4>;
  const attendance = <span><span>N/A</span></span>;

  const tr = (
    <tr className={selectors.block}>
      { createCell('Time', `${startTime} - ${endTime} `) }
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

function getFridayEndTime() {
  const date = new Date(document.querySelector('.chCal-header-space + h2').textContent);
  return isDaylightSavings(date) ? '1:45 PM' : '2:35 PM';
}

const domQuery = () => (
  isEmptySchedule() ?
    [null] :
    document.querySelectorAll('#accordionSchedules > *')
);

async function insertFreeBlock(options, unloaderContext) {
  const blocks = await waitForOne(domQuery);
  await getBlockSchedule();
  if (isEmptySchedule() || document.querySelector(`.${selectors.block}`)) {
    return;
  }
  Array.from(blocks).forEach((elem, i) => {
    const time = elem.children[0].childNodes[0].data.trim();
    const endTime = time.split('-')[1].trim();
    const fullEndTime = to24Hr(endTime);

    const recheck = (block, t) => {
      return new Promise(res => {
        setTimeout(() => {
          if (!document.body.contains(block)) {
            const newBlock = insertFreeBlock(options, unloaderContext);
            res(newBlock);
          } else {
            res(block);
          }
        }, t);
      });
    };
    const runRecheck = async block => {
      let b = block;
      for (let j = 0; j < 10; j++) {
        b = await recheck(b, 50);
      }
    };

    if (blocks[i + 1]) {
      const nextTime = blocks[i + 1].children[0].childNodes[0].data.trim();
      const nextStartTime = nextTime.split('-')[0].trim();
      const fullNextStartTime = to24Hr(nextStartTime);
      const endDate = timeStringToDate(fullEndTime);
      const nextStartDate = timeStringToDate(fullNextStartTime);

      // this catches two blocks overlapping, e.g. during Tuesday advisory lunch
      const isOverlap = compareDate(endDate, nextStartDate) > 0;

      if (!isConsecutive(fullEndTime, fullNextStartTime) && !isOverlap) {
        const freeStartTime = addMinutes(fullEndTime, 5);
        const freeEndTime = addMinutes(fullNextStartTime, -5);
        const blockLetter = getBlockLetter(freeStartTime, freeEndTime);
        const block = insertBlock(elem, freeStartTime, freeEndTime, `${blockLetter} Block`);
        unloaderContext.addRemovable(block);
        runRecheck();
      }
    } else {
      if (options.showEndBlocks) {
      // special case for A/B block
        const blockText = getTableRowColumnContent(blocks[i], 'Block');
        if (blockText === 'Mincha') {
          const insertedBlock = insertBlock(elem, '3:55 PM', '5:05 PM', `${getEndBlockLetter()} Block`);
          unloaderContext.addRemovable(insertedBlock);
          runRecheck(insertedBlock);
        }
      }
      const fridayEndTime = getFridayEndTime();
      if (getCurrentDay() === 'Friday' && endTime !== fridayEndTime) {
        const freeStartTime = addMinutes(fullEndTime, 5);
        const blockLetter = getBlockLetter(freeStartTime, fridayEndTime);
        const insertedBlock = insertBlock(elem, freeStartTime, fridayEndTime, `${blockLetter} Block`);
        unloaderContext.addRemovable(insertedBlock);
        runRecheck(insertedBlock);
      }
    }
  });
}

function freeBlock(options, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

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
