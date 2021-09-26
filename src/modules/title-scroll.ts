import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { isCurrentTime } from '~/shared/schedule';

async function titleScrollMain() {
  const date = new Date();

  // the following code should run once per class
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const endpoint = `/api/schedule/MyDayCalendarStudentList/?scheduleDate=${month}%2F${day}%2F${year}`;
  const data = await fetchApi(endpoint);
  const currentClass = data.find((block: any) => isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`));

  if (!currentClass) return;

  const endTimeString = `1/1/2001 ${currentClass.MyDayEndTime}`;
  const endTimeDate: any = new Date(endTimeString);

  // the following code should be running in a loop
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const noon = hours >= 12 ? 'PM' : 'AM';

  const currentDateString = `1/1/2001 ${hours % 12}:${minutes} ${noon}`;
  const currentTimeDate: any = new Date(currentDateString);

  let title = `MyGann | ${(endTimeDate - currentTimeDate) / 60000}min remaining`;
}

function unloadTitleScroll() {

}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Display class time remaining in scrolling tab title',
  defaultEnabled: false,
  suboptions: {},
  main: titleScrollMain,
  unload: unloadTitleScroll,
});
