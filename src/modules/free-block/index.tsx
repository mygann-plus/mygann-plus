import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import {
  addDayTableLoadedListeners,
  getAnnouncementWrap,
  getDayViewDateString,
  isEmptySchedule,
  to24Hr,
} from '~/shared/schedule';
import { isDaylightSavings, timeStringToDate } from '~/utils/date';
import { createElement, insertCss, waitForLoad } from '~/utils/dom';
import { fetchData } from '~/utils/fetch';
import log from '~/utils/log';

import style from './style.css';

const selectors = {
  activity: style.locals.activity,
  block: 'gocp_free-block_block',
};

interface BlockList {
  [block: string]: string[];
}

interface BlockSchedule {
  week: BlockList[];
  friday: {
    [fridayType: string]: BlockList
  };
  fridayWinter: {
    [fridayType: string]: BlockList
  }
  exceptions: {
    [date: string]: BlockList
  };
}

const BLOCK_SCHEDULE_PATH = '/free-block/block-schedule.json'; // eslint-disable-line max-len
const BLOCK_SCHEDULE_SCHEMA = 1;

const blockSchedule: Promise<BlockSchedule> = fetchData(BLOCK_SCHEDULE_PATH, BLOCK_SCHEDULE_SCHEMA);

const domQuery = {
  classBlocks: () => document.querySelectorAll<HTMLTableRowElement>('#accordionSchedules > *'), // schedule row elements,
  table: () => document.querySelector('#accordionSchedules'),
};

function createBlock(
  startTime: string,
  endTime: string,
  blockText: string,
) {
  const createCell = (heading: string, content: HTMLElement | string) => {
    return <td data-heading={ heading }>{content}</td>;
  };

  const activity = (
    <h4 className={selectors.activity}>
      Free Block
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
  ) as HTMLTableRowElement;

  return {
    element: tr,
    startTicks: timeStringToDate(to24Hr(startTime)).getTime(),
    endTicks: timeStringToDate(to24Hr(endTime)).getTime(),
  };
}

async function getBlockSchedule(date: Date) {
  let schedule = (await blockSchedule).exceptions[date.toLocaleDateString('en-US')];
  if (!schedule) {
    if (date.getDay() === 5) { // if it is friday
      const regex = /(?<=^- Friday )[ABC](?= \(GANN\)$)/; // get the letter out of Friday X (GANN)
      const fridayLetter = Array.from( // is it fraday a, b, or c?
        getAnnouncementWrap().children, // announcement elements (each announcement is wrapped in a div)
        announcement => regex.exec(announcement.textContent),
      ).find(Boolean)[0];

      if (!fridayLetter) log('error', 'Could not find the schedule rotation for this fine Friday');
      const fridayKey = isDaylightSavings(date) ? 'fridayWinter' : 'friday';
      schedule = (await blockSchedule)[fridayKey][fridayLetter];
    } else schedule = (await blockSchedule).week[date.getDay() - 1];
  }
  return schedule;
}

async function getMissingBlocks(date: Date, showBlocks: HTMLElement[]) {
  let allBlocks = await getBlockSchedule(date);
  return Object.entries(allBlocks).filter(([blockData]) => (
    !showBlocks.find(blockEl => blockEl.children[1].textContent.includes(blockData))
  ));
}

async function insertFreeBlock(
  opts: FreeBlockSuboptions,
  unloaderContext: UnloaderContext,
) {
  if (isEmptySchedule()) return;
  const blocks = Array.from(domQuery.classBlocks());
  if (document.querySelector(`.${selectors.block}`)) return; // if they're already inserted
  const blockObjects = blocks.map(element => ({
    element,
    startTicks: timeStringToDate(
      to24Hr((element.firstElementChild.firstChild as Text).data.split('-')[0].trim()),
    ).getTime(),
    endTicks: timeStringToDate(
      to24Hr((element.firstElementChild.firstChild as Text).data.split('-')[1].trim()),
    ).getTime(),
  }));
  const date = new Date(await getDayViewDateString());
  const missing = await getMissingBlocks(date, blocks);
  for (const [blockName, [start, end]] of missing) {
    if (
      (!opts.showOptionalZmanKodesh && blockName.includes('Z\'man Kodesh'))
      || (!opts.showEndBlocks && blockName.includes('Wellness'))
    ) continue;
    // insertBefore = the first block that starts after this one ends
    const endTicks = timeStringToDate(to24Hr(end)).getTime();
    const insertBefore = blockObjects.find(block => block.startTicks >= endTicks);

    const newBlock = createBlock(
      start,
      end,
      blockName,
    );

    if (insertBefore) domQuery.table().insertBefore(newBlock.element, insertBefore.element);
    else if (newBlock.startTicks >= blockObjects[blockObjects.length - 1].endTicks) {
      domQuery.table().appendChild(newBlock.element);
    } else continue; // if the new block just does not fit into the schedule (i.e. a welness that doesn't say wellness)
    blockObjects.splice(
      insertBefore ? blockObjects.indexOf(insertBefore) : blockObjects.length, // before insertBefore or at the end
      0, // delete 0 blocksObjects
      newBlock, // insert newBlock
    );
    unloaderContext.addRemovable(newBlock.element);
  }
}

async function freeBlockMain(
  opts: FreeBlockSuboptions,
  unloaderContext: UnloaderContext,
) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await waitForLoad(domQuery.table);
  insertFreeBlock(opts, unloaderContext);
  const listener = addDayTableLoadedListeners(() => insertFreeBlock(opts, unloaderContext));
  unloaderContext.addRemovable(listener);
}

interface FreeBlockSuboptions {
  showEndBlocks: boolean;
  showOptionalZmanKodesh: boolean;
}

export default registerModule('{5a1befbf-8fed-481d-8184-8db72ba22ad1}', {
  name: 'Show Free Blocks in Schedule',
  main: freeBlockMain,
  suboptions: {
    showEndBlocks: {
      name: 'Show Free Wellness Blocks',
      type: 'boolean',
      defaultValue: true,
    },
    showOptionalZmanKodesh: {
      name: 'Show optional Z\'man Kodesh',
      type: 'boolean',
      defaultValue: false,
    },
  },
});
