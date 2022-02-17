import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { createElement, waitForOne } from '~/utils/dom';
import { timeStringToDate } from '~/utils/date';
import {
  to24Hr,
  isCurrentClass,
  isFaculty,
  addDayTableLoadedListeners,
} from '~/shared/schedule';

function minutesTo(date: string) {
  const diffMs = (timeStringToDate(to24Hr(date)).valueOf() - new Date().valueOf());
  return Math.ceil(diffMs / 60000);
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

console.log(<div id="idddd" data-y="co-o-l-!"></div>);

async function insertClassEndingTime(blocks: HTMLElement[], unloaderContext: UnloaderContext) {
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
    ? waitForOne(() => document.querySelectorAll('.textright'))
    : waitForOne(() => document.querySelectorAll('#accordionSchedules > *'));
};

async function runClassEndingTime(unloaderContext: UnloaderContext) {
  const blocks = await getBlocks();

  // schedule sometimes renders multiple times, which removes times
  const recheck = async (block: HTMLElement) => {
    if (!document.body.contains(block)) {
      runClassEndingTime(unloaderContext);
    }
  };

  const block = await insertClassEndingTime(blocks, unloaderContext);

  if (block) {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => recheck(block), i * 50);
    }
  }

}

function classEndingTimeMain(opts: void, unloaderContext: UnloaderContext) {
  runClassEndingTime(unloaderContext);

  const interval = setInterval(() => {
    const timeLabel = document.getElementById('gocp_class-ending-time_main');
    if (timeLabel) {
      timeLabel.remove();
    }
    runClassEndingTime(unloaderContext);
  }, 60_000);
  unloaderContext.addFunction(() => clearInterval(interval));

  // const dayChangeListener = addDayChangeListeners(() => runClassEndingTime(unloaderContext));
  const dayChangeListener = addDayTableLoadedListeners(
    async () => insertClassEndingTime(await getBlocks(), unloaderContext),
    true, // require schedule to be loaded
  );
  unloaderContext.addRemovable(dayChangeListener);
}

export default registerModule('{c8a3ea86-ae06-4155-be84-1a91283fe826}', {
  name: 'Class Ending Time',
  description: 'Show how much time is left until the current class ends',
  main: classEndingTimeMain,
});
