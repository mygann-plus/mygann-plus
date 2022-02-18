import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, insertCss } from '~/utils/dom';
import { addDayChangeListener, isCurrentClass } from '~/shared/schedule';

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

// const domQuery = () => (
//   document.getElementById('accordionSchedules')
//   && document.getElementById('accordionSchedules').children[0]
//   && document.getElementById('accordionSchedules').children[0].children
//   && document.getElementById('accordionSchedules').children[0].children.length
// );

const domQuery = () => document.getElementById('accordionSchedules')?.children[0]?.children?.length;

async function highlight(blocks: HTMLCollection) {
  for (const block of blocks) {
    const timeString = (block.children[0].childNodes[0] as Text).data.trim();
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
  const recheck = (block: Element) => {
    if (!document.body.contains(block)) {
      highlight(getBlocks());
    }
  };

  const block = await highlight(getBlocks());

  for (let i = 0; i < 20; i++) {
    setTimeout(() => recheck(block), i * 50);
  }

}

function highlightCurrentClassMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  highlightClass();
  const interval = setInterval(() => {
    removeHighlight();
    highlightClass();
  }, 60_000);

  unloaderContext.addFunction(() => clearInterval(interval));

  const dayChangeListener = addDayChangeListener(highlightClass);
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
