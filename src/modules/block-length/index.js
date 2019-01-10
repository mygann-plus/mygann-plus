import registerModule from '~/module';

import { createElement, waitForOne } from '~/utils/dom';
import { to24Hr, hourStringToDate, isCurrentClass, addDayChangeListeners } from '~/shared/schedule';
import { compareDate, timeStringToDate } from '~/utils/date';

const selectors = {
  blockLengthMain: 'gocp_block-length_main',
};

function generateBlockLengthLabel(timeString) {
  const [start, end] = timeString.split('-').map(t => hourStringToDate(to24Hr(t.trim())));
  const length = Math.ceil((end - start) / 60000);

  const span = (
    <span style={{ color: 'gray' }} className={ selectors.blockLengthMain }>
      { length } mins
    </span>
  );

  return span;
}

async function insertBlockLengthLabels(timeElems, suboptions) {
  const { onlyUpcoming } = suboptions;
  const labels = [];

  for (const timeElem of timeElems) {

    const timeString = timeElem.firstChild.textContent; // prevent interference with class ending time
    const startTime = timeString.split('-')[0].trim();
    const date = timeStringToDate(to24Hr(startTime));
    const now = new Date();

    const isUpcoming = onlyUpcoming ? compareDate(date, now) === 1 : true;
    const isCurrent = await isCurrentClass(timeString);
    const labelExists = timeElem.querySelector(`.${selectors.blockLengthMain}`);

    if (!isUpcoming || isCurrent || labelExists) {
      continue;
    }

    const length = generateBlockLengthLabel(timeString);
    timeElem.appendChild(length);
    labels.push(length);
  }
  return labels;
}

function removeBlockLengthLabels() {
  const blockLengthLabels = document.querySelectorAll(`.${selectors.blockLengthMain}`);
  for (const label of blockLengthLabels) {
    label.remove();
  }
}

const domQuery = () => document.querySelectorAll('[data-heading="Time"]');

async function runBlockLength(suboptions) {
  const timeElems = await waitForOne(domQuery);

  const recheck = labels => {
    if (!document.body.contains(labels[0])) {
      insertBlockLengthLabels(domQuery(), suboptions);
    }
  };

  const labels = await insertBlockLengthLabels(timeElems, suboptions);

  setTimeout(() => recheck(labels), 50);
  setTimeout(() => recheck(labels), 100);
  setTimeout(() => recheck(labels), 200);

}


async function blockLength(suboptions, unloaderContext) {
  runBlockLength(suboptions, unloaderContext);
  const dayChangeListener = addDayChangeListeners(() => runBlockLength(suboptions));
  unloaderContext.addRemovable(dayChangeListener);

  const interval = setInterval(() => {
    removeBlockLengthLabels();
    runBlockLength(suboptions);
  }, 60000);
  unloaderContext.addFunction(() => clearInterval(interval));
}

function unloadBlockLength() {
  removeBlockLengthLabels();
}

export default registerModule('{dcac3a12-b297-4072-ada1-257a5c17aef1}', {
  name: 'Block Length',
  description: 'Show the length of class blocks',
  main: blockLength,
  unload: unloadBlockLength,
  suboptions: {
    onlyUpcoming: {
      name: 'Only upcoming blocks',
      type: 'boolean',
      defaultValue: false,
    },
  },
});

