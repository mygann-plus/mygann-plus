import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { isCurrentTime } from '~/shared/schedule';

async function titleScrollMain() {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDay();
  const year = date.getFullYear();

  const DAY_SCHEDULE_ENDPOINT = `/api/schedule/MyDayCalendarStudentList/?scheduleDate=${month}%2F${day}%2F${year}`; // eslint disable-line max-len
  const data = await fetchApi(DAY_SCHEDULE_ENDPOINT);

  const currentClass = data.find((block: any) => isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`)); // test at school

  console.log('a' + currentClass)

  if (!currentClass) return;

}

function scrollTitle(title: string) {
  setInterval(() => {
    title = title.substring(1) + title.charAt(0);
    document.title = title;
  }, 100);
}

function unloadTitleScroll() {

}

export default registerModule('{f724b60d-6d47-4497-a71e-a40d7990a2f4}', {
  name: 'Dynamic Title',
  description: 'Display class time remaining in scrolling tab title',
  defaultEnabled: false,
  suboptions: {},
  init: titleScrollMain,
  unload: unloadTitleScroll,
});
