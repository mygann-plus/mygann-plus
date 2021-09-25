import registerModule from '~/core/module';
import { fetchApi } from '~/utils/fetch';
import runWithPodiumApp from '~/utils/podiumApp';
import { getUserId } from '~/utils/user';
import {
  addDayChangeListeners,
  hasParentWithClassName,
  isCurrentDay,
  getDayViewDateString,
} from '~/shared/schedule';
import { waitForLoad, addEventListener } from '~/utils/dom';

const domQuery = () => document.querySelector('#col-main > div:nth-child(1)') as HTMLElement; // space where the schedule buttons are, they buttons themselves get replaced when the day changes

function jumpToDay(date: Date) {
  // runWithPodiumApp(`
  //   p3.loadingIcon('.schedule-list');
  //   const sched = p3.module('schedule');
  //   sched.Data.DayViewDate = new Date('${date}');
  //   sched.Us.fetchScheduleData();
  // `);
  if (true) return;
  runWithPodiumApp((p3: any, dateString: string) => {
    p3.loadingIcon('.schedule-list');
    const sched = p3.module('schedule');
    sched.Data.DayViewDate = new Date(dateString);
    sched.Us.fetchScheduleData();
  }, date.toString());
}

function topLevelStopPropagation(selectors: string[]) {
  // runWithPodiumApp(`
  //   (new MutationObserver(function() {
  //     for (let sel of ${selectors}) {
  //       let el = document.querySelector(sel);
  //       if (el) {
  //         el.addEventListener('click', function (evt) { evt.stopPropagation(); });
  //       }
  //     }
  //   })).observe(document.querySelector('#col-main > div:nth-child(1)'), { childList: true, subtree: true });
  // `);
  runWithPodiumApp((_p3: any, ...sels) => {
    // let observer = new MutationObserver(() => {
    //   for (let sel of sels) {
    //     // document.querySelector(sel)?.addEventListener('click', evt => evt.stopPropagation());
    //     let el = document.querySelector(sel);
    //     if (el) {
    //       el.addEventListener('click', evt => evt.stopPropagation());
    //     }
    //   }
    // });
    // observer.observe(
    //   document.querySelector('#col-main > div:nth-child(1)'),
    //   { childList: true, subtree: true },
    // );
    for (let sel of sels) {
      // document.querySelector(sel)?.addEventListener('click', evt => evt.stopPropagation());
    }
  }, ...selectors);
}

const calendar = (async () => {
  const endpoint = '/api/DataDirect/ScheduleList/';
  const query = `?format=json&viewerId=${await getUserId()}&personaId=2&viewerPersonaId=2&start=1630209600&end=1633838400&_=1632358572356`; // eslint-disable-line max-len
  return fetchApi(endpoint + query);
})();

async function getNextEvent(start: Date) {
  const cal = await calendar;
  return cal.find((evt: any) => !evt.allDay
    && start.getTime() < new Date(evt.start).getTime());
}

async function getPrevEvent(start: Date) {
  const cal = await calendar;
  return cal.slice().reverse().find((evt: any) => !evt.allDay
    && start.getTime() < new Date(evt.start).getTime());
}

async function skipEmptyMain() {
  const space = await waitForLoad(domQuery);
  // topLevelStopPropagation(JSON.stringify(['chCal-button-next', 'chCal-button-prev']));
  topLevelStopPropagation(['chCal-button-next', 'chCal-button-prev']);
  addEventListener(space, 'click', async e => {
    if (hasParentWithClassName(e.target as HTMLElement, ['chCal-button-next'])) { // if next day was clicked
      let date = new Date(`${await getDayViewDateString()} 11:59 PM`); // get the date in the schedule at the end of the day
      // console.log('date', date);
      let nextEvt = await getNextEvent(date);
      // console.log('next event', nextEvt);
      jumpToDay(new Date(nextEvt.start));
    } else if (hasParentWithClassName(e.target as HTMLElement, ['chCal-button-prev'])) { // if prev day was clicked
      let date = new Date(`${await getDayViewDateString()} 11:59 PM`); // get the date in the schedule at the end of the day
      let nextEvt = await getPrevEvent(date);
      jumpToDay(new Date(nextEvt.start));
    }
  });
}

export default registerModule('{42efc8ef-9de0-4eef-8e74-ba18f568b8a3}', {
  name: 'skippy',
  main: skipEmptyMain,
});
