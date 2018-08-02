import registerModule from '../utils/module';

import { fetchApi } from '../utils/fetch';
import { waitForLoad } from '../utils/dom';
import { isLeapYear } from '../utils/date';
import { getUserId } from '../utils/user';
import { isCurrentDay, addDayChangeListeners } from '../shared/schedule';

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

function fetchData() {

  const id = getUserId();

  const query = `mydayDate=${getTommorowDateString()}&viewerId=${id}&viewerPersonaId=2`;
  const endpoint = `/api/schedule/ScheduleCurrentDayAnnouncmentParentStudent/?${query}`;

  return fetchApi(endpoint)
    .then(d => (
      d.filter(m => m.Announcement !== '')[0].Announcement
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
          document.getElementsByClassName('alert alert-info')[0].innerHTML += `<div>- <i>Tommorow: ${announcements}</i></div>`;
        }
      }
    });
}

function comingUp() {
  showComingUp();
  addDayChangeListeners(() => {
    // there's a small delay between button click and date change in dom
    setTimeout(showComingUp, 100);
  });
}

export default registerModule('Coming Up', comingUp);
