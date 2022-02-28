import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { createElement } from '~/utils/dom';
import { compareDate, timeStringToDate } from '~/utils/date';
import {
  to24Hr,
  isCurrentClass,
  isFaculty,
  addAsyncDayLoadedListener,
  isCurrentDay,
} from '~/shared/schedule';
import { addMinuteListener } from '~/utils/tick';

// block length

function generateBlockLengthLabel(timeString: string) {
  const [start, end] = timeString.split('-').map(t => timeStringToDate(to24Hr(t.trim())));
  const length = Math.ceil((end.valueOf() - start.valueOf()) / 60_000);

  const span = (
    <span style={{ color: 'gray' }} className="gocp_block-length_main">
      { length } mins
    </span>
  );

  return span;
}

async function insertBlockLengthLabels(
  timeElems: NodeListOf<HTMLElement>,
  onlyUpcoming: boolean,
) {
  for (const timeElem of timeElems) {
    const timeString = timeElem.firstChild.textContent; // prevent interference with class ending time
    const startTime = timeString.split('-')[0].trim();
    const date = timeStringToDate(to24Hr(startTime));
    const now = new Date();

    const isUpcoming = !onlyUpcoming || (compareDate(date, now) === 1 && isCurrentDay());
    const isCurrent = await isCurrentClass(timeString);
    const labelExists = timeElem.querySelector('.gocp_block-length_main');

    if (!isUpcoming || isCurrent || labelExists) {
      continue;
    }

    const length = generateBlockLengthLabel(timeString);
    timeElem.appendChild(length);
  }
}

function removeBlockLengthLabels() {
  const blockLengthLabels = document.querySelectorAll('.gocp_block-length_main');
  for (const label of blockLengthLabels) {
    label.remove();
  }
}

// ending time

function minutesTo(date: string) {
  const diffMs = (timeStringToDate(to24Hr(date)).valueOf() - new Date().valueOf());
  return Math.ceil(diffMs / 60_000);
}

function addTime(minutes: number, parent: HTMLElement) {
  if (document.getElementById('gocp_class-ending-time_main')) return;

  const style = isFaculty()
    ? { color: 'grey', display: 'block' }
    : { color: 'grey', display: 'inline-block', marginTop: '10px' };

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

async function insertClassEndingTime(
  blocks: NodeListOf<Element>,
  unloaderContext: UnloaderContext,
) {
  for (const block of blocks) {
    let timeString: string;
    if (isFaculty()) {
      timeString = block.textContent.trim();
    } else {
      const timeElem = block.firstElementChild.firstChild as Text;
      timeString = timeElem.data.trim();
    }
    if (await isCurrentClass(timeString)) {
      const minutes = minutesTo(timeString.split('-')[1].trim());
      const time = addTime(minutes, block.children[0] as HTMLElement);
      if (time) {
        unloaderContext.addRemovable(time);
        return block;
      }
    }
  }
}

const getBlocks = () => {
  return isFaculty()
    ? document.querySelectorAll('.textright')
    : document.querySelectorAll('#accordionSchedules > *');
};

const getTimeElems = () => document.querySelectorAll<HTMLElement>('[data-heading="Time"]');

interface ClassEndingTimeSuboptions {
  blockLength: boolean,
  onlyUpcoming: boolean,
}

async function classEndingTimeMain(
  opts: ClassEndingTimeSuboptions,
  unloaderContext: UnloaderContext,
) {
  const dayChangeListener = await addAsyncDayLoadedListener(() => {
    insertClassEndingTime(getBlocks(), unloaderContext);
    if (opts.blockLength) {
      insertBlockLengthLabels(getTimeElems(), opts.onlyUpcoming);
    }
  });
  unloaderContext.addRemovable(dayChangeListener);

  const interval = addMinuteListener(() => {
    const timeLabel = document.getElementById('gocp_class-ending-time_main');
    if (timeLabel) {
      timeLabel.remove();
    }
    insertClassEndingTime(getBlocks(), unloaderContext);

    if (opts.blockLength) {
      removeBlockLengthLabels();
      insertBlockLengthLabels(getTimeElems(), opts.onlyUpcoming);
    }
  });
  unloaderContext.addRemovable(interval);
}

function unloadClassEndingTime() {
  removeBlockLengthLabels();
}

export default registerModule('{c8a3ea86-ae06-4155-be84-1a91283fe826}', {
  name: 'Class Ending Time',
  description: 'Show how much time is left until the current class ends and optionally block length',
  main: classEndingTimeMain,
  unload: unloadClassEndingTime,
  affectsGlobalState: true,
  suboptions: {
    blockLength: {
      name: 'Block Length',
      description: 'Show the length of class blocks',
      type: 'boolean',
      defaultValue: false,
    },
    onlyUpcoming: {
      name: 'Only upcoming blocks',
      description: 'Only show block length on upcoming blocks',
      type: 'boolean',
      defaultValue: false,
      dependent: 'blockLength',
    },
  },
});
