import registerModule from '~/module';

import { fetchApi } from '~/utils/fetch';
import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import { getUserId } from '~/utils/user';
import { isCurrentDay, addDayChangeListeners } from '~/shared/schedule';

import style from './style.css';

const selectors = {
  label: style.locals.label,
};

function getTommorowDateString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('%2F');
}

function getAnnouncementWrap() {
  return document.querySelector('#schedule-header .alert.alert-info');
}

async function fetchData() {

  const id = await getUserId();

  const query = `mydayDate=${getTommorowDateString()}&viewerId=${id}&viewerPersonaId=2`;
  const endpoint = `/api/schedule/ScheduleCurrentDayAnnouncmentParentStudent/?${query}`;

  return fetchApi(endpoint)
    .then(d => (
      d.filter(m => m.Announcement !== '').map(m => m.Announcement)
    ));
}

function createAlertBox() {
  const alertBox = (
    <div className="alert alert-info" style="margin-top:10px;">
    </div>
  );
  document.getElementsByClassName('col-md-12')[3].children[1].appendChild(alertBox);
  return alertBox;
}

const domQuery = () => (
  getAnnouncementWrap() ||
  (document.getElementsByClassName('pl-10')[0] &&
  document.getElementsByClassName('pl-10')[0].textContent === 'There is nothing scheduled for this date.') // eslint-disable-line max-len
);

async function showComingUp(unloaderContext) {
  await waitForLoad(domQuery);
  if (!isCurrentDay()) {
    return;
  }

  const announcements = await fetchData();
  if (!announcements.length) {
    return;
  }

  if (!getAnnouncementWrap()) {
    const alertBox = createAlertBox();
    unloaderContext.addRemovable(alertBox);
  }
  const label = (
      <div className={selectors.label}>
        <i>Tommorow: { announcements.join('; ') }</i>
      </div>
  );
  getAnnouncementWrap().appendChild(label);
  unloaderContext.addRemovable(label);
}

function comingUp(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  showComingUp(unloaderContext);
  const dayChangeListener = addDayChangeListeners(() => {
    // there's a small delay between button click and date change in dom
    setTimeout(() => showComingUp(unloaderContext), 100);
  });
  unloaderContext.addRemovable(dayChangeListener);
}

export default registerModule('{2b337dae-cb2f-4627-b3d6-bde7a5f2dc06}', {
  name: 'Coming Up',
  description: 'Show preview of the next day\'s events',
  main: comingUp,
});
