import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { UnloaderContext } from '~/core/module-loader';
import { addMinuteListener } from '~/utils/tick';
import { timeStringToDate, to24Hr, isCurrentTime } from '~/utils/date';
import log from '~/utils/log';
import fetchNonacademicClasses from '~/shared/nonacademic-classes';

async function getSchedule(cachedSchedule?: any[]) {
  const today = new Date().toLocaleDateString();
  if (cachedSchedule && (cachedSchedule[0].CalendarDate as string).startsWith(today)) {
    return cachedSchedule;
  }
  const [month, day, year] = today.split('/');
  const endpoint = `/api/schedule/MyDayCalendarStudentList/?scheduleDate=${month}%2F${day}%2F${year}`;
  const schedule = await fetchApi(endpoint);

  // filter out breaks so during break it displays time until next class
  const nonacademic = (await fetchNonacademicClasses()).schedule;
  return (schedule as any[]).filter(({ Block }) => !nonacademic.some(c => Block.includes(c)));
}

// check if the title was changed by MyGann+ or not
function defaultTitle(title?: string) {
  return !/\d+ min (left)|(before next class)/.test(title || document.title);
}

// to unload and revert the title
let lastTitle: string;
function changeTitle(newTitle: string) {
  if (defaultTitle()) lastTitle = document.title; // if the title is a default one it should be reverted back to it while unloading
  document.title = newTitle;
}

function clearTitle() {
  if (!defaultTitle()) document.title = lastTitle;
}

function displayTime(endTime: string, period: boolean) {
  const now = Date.now();
  const minutesRemaining = Math.ceil((timeStringToDate(to24Hr(endTime)).getTime() - now) / 60_000);
  if (minutesRemaining <= 0) log('error', `Dynamic Title Found ${minutesRemaining} remaining in class, should be more than 0`);
  changeTitle(`${minutesRemaining} min ${period ? 'left' : 'before next class'}`);
}

function updateTitle(blocks: any[]) {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`)) {
      return displayTime(block.MyDayEndTime, true);
    } if (i < blocks.length - 1 && isCurrentTime(`${block.MyDayEndTime}-${blocks[i + 1].MyDayStartTime}`)) {
      return displayTime(blocks[i + 1].MyDayStartTime, false);
    }
  }
  clearTitle();
}

async function dynamicTitleMain(opts: void, unloaderContext: UnloaderContext) {
  const observer = new MutationObserver(([mutation]) => {
    const oldTitle = (mutation.removedNodes[0] as Text)?.data; // won't exist if it is the first title load
    if (defaultTitle() && !defaultTitle(oldTitle)) {
      // if it changed from a custom one to a default unchange it
      (mutation.target.firstChild as Text).data = oldTitle;
    }
  });
  observer.observe(document.querySelector('title'), { childList: true });
  unloaderContext.addFunction(() => observer.disconnect());

  let schedule = await getSchedule();
  updateTitle(schedule);

  const interval = addMinuteListener(async () => {
    schedule = await getSchedule(schedule);
    updateTitle(schedule);
  });
  unloaderContext.addRemovable(interval);
}

function unloadDynamicTitle() {
  clearTitle();
}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Displays minutes remaining in class in tab title',
  defaultEnabled: false,
  init: dynamicTitleMain,
  unload: unloadDynamicTitle,
});
