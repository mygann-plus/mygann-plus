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
  let endTime: string = '';
  let period: number = 0;

  data.forEach((block: any, index: number) => {
    if (isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`)) {
      endTime = block.MyDayEndTime;
      period = 1;
    } else if (data[index + 1] && isCurrentTime(`${block.MyDayEndTime}-${data[index + 1].MyDayStartTime}`)) {
      endTime = data[index + 1].MyDayStartTime;
      period = 0;
    }
  });

  const endTimeString = `1/1/2001 ${endTime}`;
  const endTimeDate: any = new Date(endTimeString);

  return [endTimeDate, period];
}

async function titleScrollMain() {
  let data = await getClass();
  let endTimeDate = data[0];
  let period = data[1];

  let interval = setInterval(async () => {
    const date = new Date();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const noon = hours >= 12 ? 'PM' : 'AM';

    const currentDateString = `1/1/2001 ${hours % 12}:${minutes} ${noon}`;
    const currentTimeDate: any = new Date(currentDateString);

    let minutesRemaining = (endTimeDate - currentTimeDate) / 60000;
    if (minutesRemaining < 0) {
      clearInterval(interval);
      titleScrollMain();
      return;
    }

    document.title = period ? `${minutesRemaining} min remaining` : `${minutesRemaining} min before next class`;
  }, 30);
}

function unloadTitleScroll() {
  titleScrollMain();
}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Displays time left in class in tab title',
  defaultEnabled: false,
  main: titleScrollMain,
  unload: unloadTitleScroll,
});
