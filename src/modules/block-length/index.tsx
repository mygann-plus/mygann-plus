import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { createElement } from '~/utils/dom';
import { to24Hr, isCurrentClass, addAsyncDayTableLoadedListeners } from '~/shared/schedule';
import { compareDate, timeStringToDate } from '~/utils/date';

const selectors = {
  blockLengthMain: 'gocp_block-length_main',
};

function generateBlockLengthLabel(timeString: string) {
  const [start, end] = timeString.split('-').map(t => timeStringToDate(to24Hr(t.trim())));
  const length = Math.ceil((end.valueOf() - start.valueOf()) / 60_000);

  const span = (
    <span style={{ color: 'gray' }} className={ selectors.blockLengthMain }>
      { length } mins
    </span>
  );

  return span;
}

async function insertBlockLengthLabels(
  timeElems: NodeListOf<HTMLElement>,
  { onlyUpcoming }: BlockLengthSuboptions,
) {
  const labels = [];

  for (const timeElem of timeElems) {
    const timeString = timeElem.firstChild.textContent; // prevent interference with class ending time
    const startTime = timeString.split('-')[0].trim();
    const date = timeStringToDate(to24Hr(startTime));
    const now = new Date();

    const isUpcoming = onlyUpcoming ? compareDate(date, now) === 1 : true;
    const isCurrent = await isCurrentClass(timeString);
    const labelExists = timeElem.querySelector(`.${selectors.blockLengthMain}`);
    console.log(timeString);

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

const domQuery = () => document.querySelectorAll<HTMLElement>('[data-heading="Time"]');

async function blockLengthMain(
  suboptions: BlockLengthSuboptions,
  unloaderContext: UnloaderContext,
) {
  const dayChangeListener = await addAsyncDayTableLoadedListeners(
    () => insertBlockLengthLabels(domQuery(), suboptions),
  );
  unloaderContext.addRemovable(dayChangeListener);

  const interval = setInterval(() => {
    removeBlockLengthLabels();
    insertBlockLengthLabels(domQuery(), suboptions);
  }, 60_000);
  unloaderContext.addFunction(() => clearInterval(interval));
}

function unloadBlockLength() {
  removeBlockLengthLabels();
}

interface BlockLengthSuboptions {
  onlyUpcoming: boolean;
}

export default registerModule('{dcac3a12-b297-4072-ada1-257a5c17aef1}', {
  name: 'Block Length',
  description: 'Show the length of class blocks',
  main: blockLengthMain,
  unload: unloadBlockLength,
  defaultEnabled: false,
  suboptions: {
    onlyUpcoming: {
      name: 'Only upcoming blocks',
      type: 'boolean',
      defaultValue: false,
    },
  },
});
