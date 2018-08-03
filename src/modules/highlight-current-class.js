import { waitForLoad } from '~/utils/dom';
import registerModule from '~/utils/module';
import { isCurrentDay, addDayChangeListeners } from '~/shared/schedule';

// TIME & DATE CHECKERS

function to24Hr(t) {
  let time = t;
  let hours = Number(time.match(/^(\d+)/)[1]);
  let minutes = Number(time.match(/:(\d+)/)[1]);
  let AMPM = time.match(/\s(.*)$/)[1];
  if (AMPM == 'PM' && hours < 12) hours += 12; // eslint-disable-line eqeqeq
  if (AMPM == 'AM' && hours == 12) hours -= 12; // eslint-disable-line eqeqeq
  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if (hours < 10) sHours = `0${sHours}`;
  if (minutes < 10) sMinutes = `0${sMinutes}`;
  return `${sHours}:${sMinutes}:00`;
}
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

const domQuery = () => (
  document.getElementById('accordionSchedules')
  && document.getElementById('accordionSchedules').children[0]
  && document.getElementById('accordionSchedules').children[0].children
  && document.getElementById('accordionSchedules').children[0].children.length
);

async function highlightClass() {

  await waitForLoad(domQuery);

  const blocks = document.getElementById('accordionSchedules').children;
  for (const block of blocks) {
    const timeString = block.children[0].childNodes[0].data.trim();
    if (isCurrentClass(timeString)) {
      block.style.background = '#fff38c';
      // [audit] replace with MutationObserver; extract to shared
      setTimeout(() => {
        if (!document.body.contains(block)) {
          highlightClass();
        }
      }, 50);
    }
  }

}

function highlightCurrentClass() {
  highlightClass();
  addDayChangeListeners(highlightClass);
}

export default registerModule('Highlight Current Class in Schedule', highlightCurrentClass);
