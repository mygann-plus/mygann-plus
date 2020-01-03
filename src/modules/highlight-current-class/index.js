import registerModule from '~/core/module';

import { waitForLoad, insertCss } from '~/utils/dom';
import { addDayChangeListeners, isCurrentClass } from '~/shared/schedule';

import style from './style.css';

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

const domQuery = () => (
  document.getElementById('accordionSchedules')
  && document.getElementById('accordionSchedules').children[0]
  && document.getElementById('accordionSchedules').children[0].children
  && document.getElementById('accordionSchedules').children[0].children.length
);

async function highlight(blocks) {
  for (const block of blocks) {
    const timeString = block.children[0].childNodes[0].data.trim();
    if (await isCurrentClass(timeString)) {
      block.classList.add(selectors.currentClass);
      // [audit] replace with MutationObserver; extract to shared
      return block;
    }
  }
}

async function highlightClass() {
  await waitForLoad(domQuery);

  const getBlocks = () => document.getElementById('accordionSchedules').children;
  const recheck = block => {
    if (!document.body.contains(block)) {
      highlight(getBlocks());
    }
  };

  const block = await highlight(getBlocks());

  setTimeout(() => recheck(block), 50);
  setTimeout(() => recheck(block), 100);
  setTimeout(() => recheck(block), 200);

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

  const dayChangeListener = addDayChangeListeners(highlightClass);
  unloaderContext.addRemovable(dayChangeListener);
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
