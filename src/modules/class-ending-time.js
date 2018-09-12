import registerModule from '~/module';

import { waitForLoad } from '~/utils/dom';
import { isCurrentDay, addDayChangeListeners, to24Hr } from '~/shared/schedule';

// TIME & DATE CHECKERS

function isBetween(start, end) {
  const startTime = start;
  const endTime = end;

  const currentDate = new Date();

  const startDate = new Date(currentDate.getTime());
  startDate.setHours(startTime.split(':')[0]);
  startDate.setMinutes(startTime.split(':')[1]);
  startDate.setSeconds(startTime.split(':')[2]);

  const endDate = new Date(currentDate.getTime());
  endDate.setHours(endTime.split(':')[0]);
  endDate.setMinutes(endTime.split(':')[1]);
  endDate.setSeconds(endTime.split(':')[2]);


  return startDate < currentDate && endDate > currentDate;

}
function isCurrentTime(timeString) {
  const times = timeString.split('-').map(s => s.trim().split()).map(l => l[0]);
  return isBetween(to24Hr(times[0]), to24Hr(times[1]));
}

function isCorrectFormat() { // is on day view, not month or week
  return !!document.getElementById('accordionSchedules');
}
function isCurrentClass(timeString) {
  return isCorrectFormat() && isCurrentTime(timeString) && isCurrentDay();
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
  return Math.round(((diffMs % 86400000) % 3600000) / 60000);
}

function addTime(minutes, parent) {
  if (document.getElementById('gocp_class-ending-time_main')) return;

  const br = document.createElement('br');
  const span = document.createElement('span');

  span.style.color = 'grey';
  span.style.display = 'inline-block';
  span.style.marginTop = '10px';
  span.textContent = `${minutes} minutes left`;
  span.id = 'gocp_class-ending-time_main';
  parent.appendChild(br);
  parent.appendChild(span);

  setInterval(() => {
    minutes--;
    span.textContent = `${minutes} minutes left`;
  }, 60000);

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

  for (const block of blocks) {
    const timeString = block.children[0].childNodes[0].data.trim();
    if (isCurrentClass(timeString)) {
      const minutes = minutesTo(timeString.split('-')[1].trim());
      const time = addTime(minutes, block.children[0]);
      const timeRemovable = unloaderContext.addRemovable(time);
      setTimeout(() => {
        if (!document.body.contains(block)) {
          timeRemovable.remove();
          testForClass(unloaderContext);
        }
      }, 50);
    }
  }

}

function classEndingTime(opts, unloaderContext) {
  testForClass(unloaderContext);
  addDayChangeListeners(() => testForClass(unloaderContext));
}

export default registerModule('{c8a3ea86-ae06-4155-be84-1a91283fe826}', {
  name: 'Class Ending Time',
  description: 'Show how much time is left until the current class ends',
  main: classEndingTime,
});

