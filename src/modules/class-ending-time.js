import registerModule from '~/module';

import { createElement, waitForOne } from '~/utils/dom';
import { timeStringToDate } from '~/utils/date';
import {
  to24Hr,
  addDayChangeListeners,
  isCurrentClass,
  isFaculty,
} from '~/shared/schedule';

function minutesTo(date) {
  const diffMs = (timeStringToDate(to24Hr(date)) - new Date());
  return Math.ceil(diffMs / 60000);
}

function addTime(minutes, parent) {
  if (document.getElementById('gocp_class-ending-time_main')) return;

  const style = isFaculty() ?
    { color: 'grey', display: 'block' } :
    { color: 'grey', display: 'inline-block', marginTop: '10px' };

  const span = (
    <span
      style={style}
      id='gocp_class-ending-time_main'
    >
      { minutes } minutes left
    </span>
  );

  parent.appendChild(span);
  return span;
}

async function insertClassEndingTime(blocks, unloaderContext) {
  for (const block of blocks) {
    let timeString;
    if (isFaculty()) {
      timeString = block.textContent.trim();
    } else {
      timeString = block.children[0].childNodes[0].data.trim();
    }
    if (await isCurrentClass(timeString)) {
      const minutes = minutesTo(timeString.split('-')[1].trim());
      const time = addTime(minutes, block.children[0]);
      if (time) {
        unloaderContext.addRemovable(time);
      }
    }
  }
}

const getBlocks = async () => {
  return isFaculty() ?
    waitForOne(() => document.querySelectorAll('.textright')) :
    waitForOne(() => document.querySelectorAll('#accordionSchedules > *'));
};

async function runClassEndingTime(unloaderContext) {
  const blocks = await getBlocks();

  const recheck = async block => {
    if (!document.body.contains(block)) {
      insertClassEndingTime(await getBlocks(), unloaderContext);
    }
  };

  const block = await insertClassEndingTime(blocks, unloaderContext);

  setTimeout(() => recheck(block), 50);
  setTimeout(() => recheck(block), 100);
  setTimeout(() => recheck(block), 200);
}

function classEndingTime(opts, unloaderContext) {
  runClassEndingTime(unloaderContext);

  const interval = setInterval(() => {
    const timeLabel = document.getElementById('gocp_class-ending-time_main');
    if (timeLabel) {
      timeLabel.remove();
    }
    runClassEndingTime(unloaderContext);
  }, 60000);
  unloaderContext.addFunction(() => clearInterval(interval));

  const dayChangeListener = addDayChangeListeners(() => runClassEndingTime(unloaderContext));
  unloaderContext.addRemovable(dayChangeListener);
}

export default registerModule('{c8a3ea86-ae06-4155-be84-1a91283fe826}', {
  name: 'Class Ending Time',
  description: 'Show how much time is left until the current class ends',
  main: classEndingTime,
});

