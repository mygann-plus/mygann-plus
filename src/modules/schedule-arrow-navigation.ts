import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { addEventListener, waitForLoad } from '~/utils/dom';

const domQuery = {
  prevButton: () => document.querySelector('.chCal-button-prev') as HTMLElement,
  nextButton: () => document.querySelector('.chCal-button-next') as HTMLElement,
};

async function scheduleArrowNavigation(opts: never, unloaderContext: UnloaderContext) {
  await waitForLoad(domQuery.prevButton);

  const listener = addEventListener(document.body, 'keydown', e => {

    const focusedInput = document.querySelector('input:focus');
    if (focusedInput) {
      return;
    }

    if (e.key === 'ArrowLeft') {
      domQuery.prevButton().click();
    } else if (e.key === 'ArrowRight') {
      domQuery.nextButton().click();
    }

  });

  unloaderContext.addRemovable(listener);
}

export default registerModule('{0087928a-08ae-4c53-8f04-742197234529}', {
  name: 'Schedule Arrow Navigation',
  description: 'Use the arrow keys to switch days in the schedule',
  main: scheduleArrowNavigation,
  affectsGlobalState: true,
});
