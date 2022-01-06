import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { isCurrentTime, to24Hr } from '~/shared/schedule';
import { timeStringToDate } from '~/utils/date';
import { UnloaderContext } from '~/core/module-loader';

let cachedSchedule: { schedule: Promise<any[]>, dateString: string };
function getTodaySchedule() {
  const date = new Date();
  const dateString = date.toLocaleDateString();
  if (cachedSchedule?.dateString !== dateString) { // basically if it has moved to the next day. Go to sleep
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const endpoint = `/api/schedule/MyDayCalendarStudentList/?scheduleDate=${month}%2F${day}%2F${year}`;
    cachedSchedule = { schedule: fetchApi(endpoint), dateString };
    // cachedSchedule.schedule.then(data => { data[data.length - 1].MyDayEndTime = '11:00 PM'; }); // to test outside school hours
  }
  return cachedSchedule;
}

async function getClass() {
  const schedule = await getTodaySchedule().schedule;

  let endTimeString: string;
  let period: boolean;

  schedule.find((block: any, index: number) => {
    if (isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`)) {
      endTimeString = block.MyDayEndTime;
      period = true;
    } else if (schedule[index + 1] && isCurrentTime(`${block.MyDayEndTime}-${schedule[index + 1].MyDayStartTime}`)) {
      endTimeString = schedule[index + 1].MyDayStartTime;
      period = false;
    } else return false;
    return true;
  });

  const endTime = endTimeString && timeStringToDate(to24Hr(endTimeString)).getTime();

  return { endTime, period };
}

// check if the title was changed by MyGann+ or not
function defaultTitle(title?: string) {
  return !/\d+ min (remaining)|(before next class)/.test(title || document.title);
}

// to unload and revert the title
let lastTitle: string;
function changeTitle(newTitle: string) {
  if (defaultTitle()) lastTitle = document.title; // if the title is a default one it should be reverted back to it while unloading
  document.title = newTitle;
}

function displayTime(endTime: number, period: boolean) {
  const now = Date.now();
  const minutesRemaining = Math.ceil((endTime - now) / 60e3);
  if (minutesRemaining >= 0) {
    changeTitle(`${minutesRemaining} min ${period ? 'remaining' : 'before next class'}`);
  }
  return minutesRemaining;
}

const config: MutationObserverInit = { childList: true };
const observer = new MutationObserver(([mutation], obs) => {
  const oldTitle = (mutation.removedNodes[0] as Text).data;
  if (!defaultTitle() || defaultTitle(oldTitle)) return; // if it is now using a custom one or if it just had a defult one don't switch

  obs.disconnect(); // so the observer doesn't fire itself
  changeTitle(oldTitle); // if the old one was set by MyGann+ bring it back
  obs.observe(mutation.target, config);
});

function unloadTitleScroll() {
  observer.disconnect();
  if (!defaultTitle()) document.title = lastTitle;
}

async function titleScrollMain(opts: void, unloaderContext: UnloaderContext) {
  const { endTime, period } = await getClass();

  if (!endTime) {
    unloadTitleScroll();
    const today = new Date();
    const now = today.getTime();
    const midnight = today.setHours(24, 0, 0, 0);
    return setTimeout(titleScrollMain, midnight - now, opts, unloaderContext); // run again at midnight
  }

  displayTime(endTime, period);
  observer.observe(document.querySelector('title'), config);

  let interval = setInterval(() => {
    if (displayTime(endTime, period) < 0) {
      clearInterval(interval);
      unloadTitleScroll();
      titleScrollMain(opts, unloaderContext);
    }
  }, 30e3);

  unloaderContext.addFunction(() => clearInterval(interval));
}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Displays minutes remaining in class in tab title',
  defaultEnabled: false,
  init: titleScrollMain,
  unload: unloadTitleScroll,
});
