import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { isCurrentTime } from '~/shared/schedule';

async function getClass() {
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const endpoint = `/api/schedule/MyDayCalendarStudentList/?scheduleDate=${month}%2F${day}%2F${year}`;
  const data = await fetchApi(endpoint);

  // for (let block in data) {
  //   if (isCurrentTime(`${data[block].MyDayStartTime}-${data[block].MyDayEndTime}`)) {
  //     console.log('current', data[block].MyDayEndTime);
  //     break;
  //   } else if (data[block + 1] !== undefined) {
  //     if (isCurrentTime(`${data[block].MyDayEndTime}-${data[block + 1].MyDayStartTime}`)) {
  //       console.log('next', data[block], data[block + 1], block);
  //     }
  //   }
  // }

  const currentClass = data.find((block: any) => isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`));
  const nextClass = data[data.findIndex((nextBlock: any) => nextBlock === currentClass) + 1];

  const currentClassEndTimeString = `1/1/2001 ${currentClass.MyDayEndTime}`;
  const currentClassEndTimeDate: any = new Date(currentClassEndTimeString);

  let nextClassEndTimeString: string;
  let nextClassEndTimeDate: Date;

  if (nextClass) {
    nextClassEndTimeString = `1/1/2001 ${nextClass.MyDayStartTime}`;
    nextClassEndTimeDate = new Date(nextClassEndTimeString);
  }

  return [currentClassEndTimeDate, nextClassEndTimeDate];
}

let dates: any = [];

async function setTitle(next: Boolean) {
  if (!next) dates = await getClass();
  const endTimeDate = next ? dates[1] : dates[0];

  let interval = setInterval(async () => {
    const date = new Date();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const noon = hours >= 12 ? 'PM' : 'AM';

    const currentDateString = `1/1/2001 ${hours % 12}:${minutes} ${noon}`;
    const currentTimeDate: any = new Date(currentDateString);

    let minutesRemaining = (await endTimeDate - currentTimeDate) / 60000;

    if (minutesRemaining < 0) {
      clearInterval(interval);
      if (!next) setTitle(true);
      if (next) setTitle(false);
      return;
    } else if (minutesRemaining > 120) {
      return;
    }

    document.title = next ? `${minutesRemaining} min before next class` : `${minutesRemaining} min remaining`;
  }, 60);
}

async function titleScrollMain() {
  setTitle(false);
}

function unloadTitleScroll() {
  document.title = '';
  setTitle(false);
}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Display class time remaining in scrolling tab title',
  defaultEnabled: false,
  suboptions: {},
  main: titleScrollMain,
  unload: unloadTitleScroll,
});
