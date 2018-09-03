import registerModule from '~/module';

import { fetchApi } from '~/utils/fetch';
import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import { isLeapYear } from '~/utils/date';
import { getUserId } from '~/utils/user';
import { isCurrentDay, addDayChangeListeners } from '~/shared/schedule';

import style from './style.css';

const selectors = {
  label: style.locals.label,
};

function getTommorowDateString() {
  const dateObj = new Date();
  let date = dateObj.getDate();
  let month = dateObj.getMonth();

  // calculate the month rollover
  const thirtyDayMonths = [3, 5, 7, 10];
  if (thirtyDayMonths.indexOf(month) > -1 && date + 1 > 30) {
    month++;
    date = 1;
  } else if (month === 1) {
    if (isLeapYear() && date + 1 > 29) {
      month++;
      date = 1;
    } else if (date + 1 > 28) {
      month++;
      date = 1;
    }
  } else if (date + 1 > 31) {
    month++;
    date = 0;
  } else {
    date++;
  }

  return [month + 1, date, dateObj.getFullYear()].join('%2F');

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
  const html = `
    <div class="alert alert-info" style="margin-top:10px;">
    </div>
  `;
  document.getElementsByClassName('col-md-12')[3].children[1].innerHTML += html;
}

const domQuery = () => (
  document.getElementsByClassName('alert alert-info').length ||
  (document.getElementsByClassName('pl-10')[0] &&
  document.getElementsByClassName('pl-10')[0].textContent === 'There is nothing scheduled for this date.') // eslint-disable-line max-len
);
function showComingUp() {
  waitForLoad(domQuery)
    .then(async () => {
      if (isCurrentDay()) {
        const announcements = await fetchData();
        if (!document.getElementsByClassName('alert alert-info').length) {
          createAlertBox();
        }
        if (announcements.length) {
          const label = (
            <div className={selectors.label}><i>Tommorow: { announcements.join('; ') }</i></div>
          );
          document.getElementsByClassName('alert alert-info')[0].appendChild(label);
        }
      }
    });
}

function comingUp(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  showComingUp();
  addDayChangeListeners(() => {
    // there's a small delay between button click and date change in dom
    setTimeout(showComingUp, 100);
  });
}

export default registerModule('{2b337dae-cb2f-4627-b3d6-bde7a5f2dc06}', {
  name: 'Coming Up',
  description: 'Show preview of the next day\'s events',
  main: comingUp,
});
