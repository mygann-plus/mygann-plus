import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, insertCss } from '~/utils/dom';
import tick from '~/utils/tick';

import style from './style.css';

const selectors = {
  temporaryHiddenBox: style.locals['temporary-hidden-box'],
};

const domQuery = {
  wraps: [
    () => document.querySelector('#conduct'),
    () => document.querySelector('#performance'),
    () => document.querySelector('#attendance'),
  ],
  chevron: (wrap: HTMLElement) => wrap.querySelector('.bb-tile-chevron') as HTMLElement,
  content: (wrap: HTMLElement) => wrap.querySelector('.bb-tile-content') as HTMLElement,
};

async function collapseBox(wrap: HTMLElement) {
  const chevron = await waitForLoad(() => domQuery.chevron(wrap));
  const content = await waitForLoad(() => domQuery.content(wrap));

  chevron.click();
  content.classList.add(selectors.temporaryHiddenBox);
  await tick(500);
  content.classList.remove(selectors.temporaryHiddenBox);
}

async function autocollapseProgressBoxesMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  for (const wrapQuery of domQuery.wraps) {
    // boxes are rendered at different times; this collapses each as they appear
    waitForLoad(wrapQuery).then(collapseBox);
  }
}

export default registerModule('{cc6276bc-c12a-49a7-a289-d6c7d5b67398}', {
  name: 'Automatically Collapse Progress Boxes',
  description: 'Automatically collapse performance, conduct, and attendance summary boxes.',
  main: autocollapseProgressBoxesMain,
  defaultEnabled: false,
});
