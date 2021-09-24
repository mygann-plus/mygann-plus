import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import { isCurrentTime } from '~/shared/schedule';

async function titleScrollMain() {
  const date = new Date();

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const endpoint = `/api/schedule/MyDayCalendarStudentList/?scheduleDate=${month}%2F${day}%2F${year}`;
  const data = await fetchApi(endpoint);
  const currentClass = data.find((block: any) => isCurrentTime(`${block.MyDayStartTime}-${block.MyDayEndTime}`));

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
  main: titleScrollMain,
  unload: unloadTitleScroll,
});
