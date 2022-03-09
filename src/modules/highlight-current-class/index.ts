import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { insertCss } from '~/utils/dom';
import { addAsyncDayLoadedListener, isCurrentClass } from '~/shared/schedule';

import style from './style.css';
import { addMinuteListener } from '~/utils/tick';

const selectors = {
  currentClass: style.locals['current-class'],
};

function removeHighlight() {
  // only one block is supposed to be highlighted, but this is in case a bug causes multiple to be
  const highlightedBlocks = document.querySelectorAll(`.${selectors.currentClass}`);
  for (const block of highlightedBlocks) {
    block.classList.remove(selectors.currentClass);
  }
}

async function highlight() {
  const blocks = document.getElementById('accordionSchedules').children;
  for (const block of blocks) {
    const timeString = (block.children[0].childNodes[0] as Text).data.trim();
    if (await isCurrentClass(timeString)) {
      block.classList.add(selectors.currentClass);
      return block;
    }
  }
}

async function highlightCurrentClassMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const interval = addMinuteListener(() => {
    removeHighlight();
    highlight();
  });

  unloaderContext.addRemovable(interval);

  // const dayChangeListener = addDayChangeListener(highlightClass);
  const dayChangeListener = await addAsyncDayLoadedListener(highlight);
  unloaderContext.addRemovable(dayChangeListener);
}

function unloadHighlightCurrentClass() {
  removeHighlight();
}

export default registerModule('{c9550c66-5dc8-4132-a359-459486a8ab08}', {
  name: 'Highlight Current Class in Schedule',
  main: highlightCurrentClassMain,
  unload: unloadHighlightCurrentClass,
  affectsGlobalState: true,
});
