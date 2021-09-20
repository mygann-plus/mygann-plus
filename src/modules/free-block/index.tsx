import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

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
function isConsecutive(start: string, end: string) {
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
function addMinutes(time: string, mins: number) {
  const newDate = new Date(timeStringToDate(time).getTime() + (mins * 60000));
  return dateTo12HrTimeString(newDate);
}

function insertBlock(
  elemBefore: HTMLElement,
  startTime: string,
  endTime: string,
  blockText: string,
  independentStudy?: boolean,
  independentStudyName?: string,
) {
  const createCell = (heading: string, content: HTMLElement | string) => {
    return <td data-heading={ heading }>{content}</td>;
  };

  const activity = (
    <h4 className={selectors.activity}>
      { independentStudy ? independentStudyName : 'Free Block'}
    </h4>
  );
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
  return '12:00 PM'; // temporary end time, due to quarentine
}

const domQuery = () => (
  document.querySelectorAll('#accordionSchedules > *')
);

async function insertFreeBlock(
  options: FreeBlockSuboptions,
  unloaderContext: UnloaderContext,
) {
  if (isEmptySchedule()) {
    return;
  }
  const blocks = await waitForOne(domQuery);
  if (document.querySelector(`.${selectors.block}`)) {
    return;
  }
  Array.from(blocks).forEach((elem, i) => {
    const time = (elem.children[0].childNodes[0] as Text).data.trim();
    const endTime = time.split('-')[1].trim();
    const fullEndTime = to24Hr(endTime);

    const recheck = (block: HTMLElement, t: number) => {
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

    const runRecheck = async (block: HTMLElement) => {
      for (let j = 0; j < 10; j++) {
        await recheck(block, 50);
      }
    };

    if (blocks[i + 1]) {
      const nextTime = (blocks[i + 1].children[0].childNodes[0] as Text).data.trim();
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
        const independentStudyEnabled = options.independentStudy
          && blockLetter === options.independentStudyBlock;

        const block = insertBlock(
          elem,
          freeStartTime,
          freeEndTime,
          `${blockLetter} Block`,
          independentStudyEnabled,
          options.independentStudyName,
        );
        unloaderContext.addRemovable(block);
        runRecheck(block);
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
        const independentStudyEnabled = blockLetter === options.independentStudyBlock;
        const insertedBlock = insertBlock(
          elem,
          freeStartTime,
          fridayEndTime,
          `${blockLetter} Block`,
          independentStudyEnabled,
          options.independentStudyName,
        );
        unloaderContext.addRemovable(insertedBlock);
        runRecheck(insertedBlock);
      }
    }
  });
}

async function freeBlockMain(
  options: FreeBlockSuboptions,
  unloaderContext: UnloaderContext,
) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await getBlockSchedule(); // caches schedule data
  insertFreeBlock(options, unloaderContext);

  const dayChangeListener = addDayChangeListeners(() => insertFreeBlock(options, unloaderContext));
  unloaderContext.addRemovable(dayChangeListener);
}

interface FreeBlockSuboptions {
  showEndBlocks: boolean;
  independentStudy: boolean;
  independentStudyBlock: string;
  independentStudyName: string;
}

export default registerModule('{5a1befbf-8fed-481d-8184-8db72ba22ad1}', {
  name: 'Show Free Blocks in Schedule',
  main: freeBlockMain,
  suboptions: {
    showEndBlocks: {
      name: 'Show Free A/B Blocks',
      type: 'boolean',
      defaultValue: true,
    },
    independentStudy: {
      name: 'Independent Study',
      type: 'boolean',
      defaultValue: false,
    },
    independentStudyBlock: {
      name: 'Independent Study Block',
      type: 'enum',
      defaultValue: '',
      enumValues: {
        C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', // H: 'H', I: 'I', J: 'J', // blocks only go up to G 2021-2022
      },
      dependent: 'independentStudy', // will only show if independentStudy is true
    },
    independentStudyName: {
      name: 'Independent Study Name',
      type: 'string',
      defaultValue: '',
      dependent: 'independentStudy',
    },
  },
});
