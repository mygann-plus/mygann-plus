import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { isCurrentTime, to24Hr } from '~/shared/schedule';
import { timeStringToDate } from '~/utils/date';

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

function changeTitle(endTime: number, period: boolean) {
  const now = Date.now();
  const minutesRemaining = (endTime - now) / 60e3;
  if (minutesRemaining >= 0) {
    document.title = `${minutesRemaining} min ${period ? 'remaining' : 'before next class'}`;
  }
  return minutesRemaining;
}

async function titleScrollMain() {
  const { endTime, period } = await getClass();

  if (!endTime) {
    const today = new Date();
    const now = today.getTime();
    const midnight = today.setHours(24, 0, 0, 0);
    return setTimeout(titleScrollMain, midnight - now); // run again at midnight
  }

  changeTitle(endTime, period);

  let interval = setInterval(() => {
    if (changeTitle(endTime, period) < 0) {
      clearInterval(interval);
      titleScrollMain();
    }
  }, 30e3);
}

function unloadTitleScroll() {
  titleScrollMain();
}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Displays minutes remaining in class in tab title',
  defaultEnabled: false,
  main: titleScrollMain,
  unload: unloadTitleScroll,
});
