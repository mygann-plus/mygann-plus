import { fetchData } from '~/utils/fetch';
import { getCurrentDay } from '~/shared/schedule';

const BLOCK_SCHEDULE_PATH = '/free-block/block-schedule.json'; // eslint-disable-line max-len
const BLOCK_SCHEDULE_SCHEMA = 1;

interface BlockList {
  [block: string]: string[];
}

interface BlockSchedule {
  week: BlockList[];
  friday: {
    [fridayType: string]: BlockList
  };
  exceptions: {
    [date: string]: BlockList
  };
}

let blockSchedule: BlockSchedule = null;

export async function getBlockSchedule() {
  if (!blockSchedule) {
    blockSchedule = await fetchData(BLOCK_SCHEDULE_PATH, BLOCK_SCHEDULE_SCHEMA);
  }
  return blockSchedule;
}

export function getBlockLetter(startTime: string, endTime: string) {
  if (!blockSchedule) {
    return 'Free';
  }

  const isCorrectTime = (time: string[]) => time[0] === startTime && time[1] === endTime;

  const dateString = document.querySelector('.chCal-header-space + h2').textContent;
  const date = new Date(dateString);
  const day = date.getDay();
  let letters: BlockList = {};
  let blockLetter = '';

  letters = blockSchedule.week[day - 1]; // temporary overide for quarentine

  for (const letter in letters) {
    const time = letters[letter];
    if (isCorrectTime(time)) {
      blockLetter = letter;
    }
  }

  const exceptions = blockSchedule.exceptions[date.toLocaleDateString('en-US')];
  if (exceptions) {
    for (const exceptionLetter in exceptions) {
      const time = exceptions[exceptionLetter];
      if (isCorrectTime(time)) {
        blockLetter = exceptionLetter;
      }
    }
  }

  return blockLetter || 'Free';
}

// returns "A" or "B" depending on day of week
export function getEndBlockLetter() {
  const day = getCurrentDay();
  if (day === 'Monday' || day === 'Wednesday') {
    return 'A';
  } else {
    return 'B';
  }
}
