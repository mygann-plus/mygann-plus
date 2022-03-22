import registerModule from '~/core/module';
import { createElement } from '~/utils/dom';
import { UnloaderContext } from '~/core/module-loader';
import { changeDate, getDayViewDateString, getPermanentHeader } from '~/shared/schedule';

import flatpickr from 'flatpickr';
import { BaseOptions } from 'flatpickr/dist/types/options';

async function datePickerMain(opts: void, unloaderContext: UnloaderContext) {
  const link = (
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" // importing style is difficult because of locals
    />
  );
  document.head.appendChild(link);
  unloaderContext.addRemovable(link);

  const config: Partial<BaseOptions> = {
    async onChange([date], dateString, picker) {
      if (date.getTime() === new Date(await getDayViewDateString()).getTime()) return; // if the selected date is the date already selected
      changeDate(date);
      picker.destroy();
    },
  };

  let picker: flatpickr.Instance;

  const obs = new MutationObserver(([{ addedNodes }]) => {
    const dateText = (addedNodes[0] as HTMLElement).querySelector('.chCal-header-space + h2');
    if (dateText) {
      picker?.destroy();
      picker = flatpickr(dateText, config);
    }
  });

  const startingText = document.querySelector('.chCal-header-space + h2');
  if (startingText) picker = flatpickr(startingText, config); // if it was loaded after schedule

  obs.observe(await getPermanentHeader(), { childList: true });

  unloaderContext.addFunction(() => { obs.disconnect(); picker.destroy(); });
}

export default registerModule('{2e5e7964-ff75-4bd9-925a-fd7e9b024c69}', {
  name: 'Schedule Date Picker',
  description: 'Open a dialogue to pick a date in the schedule',
  main: datePickerMain,
  affectsGlobalState: true,
});
