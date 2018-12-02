import registerModule from '~/module';

import { createElement, waitForLoad } from '~/utils/dom';
import {
  isCurrentDay,
  isCurrentTime,
  isDayView,
  to24Hr,
  addDayChangeListeners,
} from '~/shared/schedule';

function isCurrentClass(timeString) {
  return isDayView() && isCurrentTime(timeString) && isCurrentDay();
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
  return Math.ceil(diffMs / 60000);
}

function addTime(minutes, parent) {
  if (document.getElementById('gocp_class-ending-time_main')) return;

  const span = (
    <span
      style={{ color: 'grey', display: 'inline-block', marginTop: '10px' }}
      id='gocp_class-ending-time_main'
    >
      { minutes } minutes left
    </span>
  );

  parent.appendChild(span);
  return span;
}

const domQuery = () => {
  return document.getElementById('accordionSchedules')
        && document.getElementById('accordionSchedules').children[0]
        && document.getElementById('accordionSchedules').children[0].children
        && document.getElementById('accordionSchedules').children[0].children.length;
};

async function testForClass(unloaderContext) {

  await waitForLoad(domQuery);

  const blocks = document.getElementById('accordionSchedules').children;

  const recheck = (block, removable) => {
    if (!document.body.contains(block)) {
      removable.remove();
      testForClass(unloaderContext);
    }
  };

  for (const block of blocks) {
    const timeString = block.children[0].childNodes[0].data.trim();
    if (isCurrentClass(timeString)) {
      const minutes = minutesTo(timeString.split('-')[1].trim());
      const time = addTime(minutes, block.children[0]);
      const timeRemovable = unloaderContext.addRemovable(time);
      setTimeout(() => recheck(block, timeRemovable), 50);
      setTimeout(() => recheck(block, timeRemovable), 100);
      setTimeout(() => recheck(block, timeRemovable), 200);
    }
  }

}

function classEndingTime(opts, unloaderContext) {
  testForClass(unloaderContext);

  const interval = setInterval(() => {
    const timeLabel = document.getElementById('gocp_class-ending-time_main');
    if (timeLabel) {
      timeLabel.remove();
    }
    testForClass(unloaderContext);
  }, 60000);
  unloaderContext.addFunction(() => clearInterval(interval));

  const dayChangeListener = addDayChangeListeners(() => testForClass(unloaderContext));
  unloaderContext.addRemovable(dayChangeListener);
}

export default registerModule('{c8a3ea86-ae06-4155-be84-1a91283fe826}', {
  name: 'Class Ending Time',
  description: 'Show how much time is left until the current class ends',
  main: classEndingTime,
});

