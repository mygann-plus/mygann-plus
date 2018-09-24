import { waitForLoad, insertCss } from '~/utils/dom';
import registerModule from '~/module';
import { isCurrentDay, addDayChangeListeners } from '~/shared/schedule';

import style from './style.css';

const selectors = {
  currentClass: style.locals['current-class'],
};

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

function removeHighlight() {
  // only one block is supposed to be highlighted, but this is in case a bug causes multiple to be
  const highlightedBlocks = document.querySelectorAll(`.${selectors.currentClass}`);
  for (const block of highlightedBlocks) {
    block.classList.remove(selectors.currentClass);
  }
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
      block.classList.add(selectors.currentClass);
      // [audit] replace with MutationObserver; extract to shared
      setTimeout(() => {
        if (!document.body.contains(block)) {
          highlightClass();
        }
      }, 50);
    }
  }

}

function highlightCurrentClass(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  highlightClass();
  const interval = setInterval(() => {
    removeHighlight();
    highlightClass();
  }, 60000);

  unloaderContext.addFunction(() => clearInterval(interval));

  addDayChangeListeners(highlightClass);
}

function unloadHighlightCurrentClass() {
  removeHighlight();
}

export default registerModule('{c9550c66-5dc8-4132-a359-459486a8ab08}', {
  name: 'Highlight Current Class in Schedule',
  main: highlightCurrentClass,
  unload: unloadHighlightCurrentClass,
  affectsGlobalState: true,
});
