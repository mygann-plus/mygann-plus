import { fetchData } from '~/utils/fetch';
import { getCurrentDay } from '~/shared/schedule';

const BLOCK_SCHEDULE_PATH = '/free-block/block-schedule.json'; // eslint-disable-line max-len
const BLOCK_SCHEDULE_SCHEMA = 1;
let blockSchedule = null;

export async function getBlockSchedule() {
  if (!blockSchedule) {
    blockSchedule = await fetchData(BLOCK_SCHEDULE_PATH, BLOCK_SCHEDULE_SCHEMA);
  }
  return blockSchedule;
}

export function getBlockLetter(startTime, endTime) {
  if (!blockSchedule) {
    return 'Free';
  }

  const isCorrectTime = time => time[0] === startTime && time[1] === endTime;

  const dateString = document.querySelector('.chCal-header-space + h2').textContent;
  const date = new Date(dateString);
  const day = date.getDay();
  let letters = [];
  let blockLetter = '';

  if (day !== 5) { // monday-thursday
    letters = blockSchedule.week[day - 1];
  } else { // friday
    const announcement = document.querySelector('.alert-info div:nth-child(2)');
    const fridayType = announcement.textContent.split('Friday')[1].split('-')[0].trim();
    letters = blockSchedule.friday[fridayType];
  }

  for (const letter in letters) {
    const time = letters[letter];
    if (isCorrectTime(time)) {
      blockLetter = letter;
    }
  }

  const exceptions = blockSchedule.exceptions[date.toLocaleDateString()];
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
