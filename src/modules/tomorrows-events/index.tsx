import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { fetchApi } from '~/utils/fetch';
import { createElement } from '~/utils/dom';
import { getUserId } from '~/utils/user';
import { isCurrentDay, getAnnouncementWrap, getPermanentHeader } from '~/shared/schedule';

function getTomorrowDateString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('%2F');
}

async function fetchData(): Promise<string[]> {
  const id = await getUserId();

  const query = `mydayDate=${getTomorrowDateString()}&viewerId=${id}&viewerPersonaId=2`;
  const endpoint = `/api/schedule/ScheduleCurrentDayAnnouncmentParentStudent/?${query}`;

  return fetchApi(endpoint)
    .then(d => (
      d.filter((m: any) => m.Announcement !== '').map((m: any) => m.Announcement)
    ));
}

function createAlertBox() {
  const alertBox = (
    <div className="alert alert-info" style={{ marginTop: '10px' }}>
    </div>
  );
  document.getElementsByClassName('col-md-12')[3].children[1].appendChild(alertBox);
  return alertBox;
}

async function showTomorrowsEvents(unloaderContext: UnloaderContext) {
  if (!(await isCurrentDay())) {
    return;
  }

  const announcements = await fetchData();
  if (!announcements.length) {
    return;
  }

  let wrap = getAnnouncementWrap();

  if (!wrap) {
    wrap = createAlertBox();
    unloaderContext.addRemovable(wrap);
  }

  const label = (
      <div style={{ marginLeft: 'auto' }}>
        <i>Tomorrow: { announcements.join('; ') }</i>
      </div>
  );
  wrap.appendChild(label);
  unloaderContext.addRemovable(label);
}

async function tomorrowsEventsMain(opts: void, unloaderContext: UnloaderContext) {
  if (document.getElementById('schedule-header')) showTomorrowsEvents(unloaderContext); // if the module was loaded after the schedule
  const observer = new MutationObserver(([{ addedNodes }]) => {
    if ((addedNodes[0] as HTMLElement).id === 'schedule-header') {
      showTomorrowsEvents(unloaderContext);
    }
  });
  observer.observe(await getPermanentHeader(), { childList: true });
  unloaderContext.addFunction(() => observer.disconnect());
}

export default registerModule('{2b337dae-cb2f-4627-b3d6-bde7a5f2dc06}', {
  name: 'Tomorrow\'s Events',
  description: 'Show preview of the next day\'s events',
  main: tomorrowsEventsMain,
  defaultEnabled: false,
});
