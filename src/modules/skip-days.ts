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

// function jumpToDay(date: Date) {
//   runWithPodiumApp((p3: any, dateString) => {
//     p3.loadingIcon('.schedule-list');
//     const sched = p3.module('schedule');
//     sched.Data.DayViewDate = new Date(dateString);
//     sched.Us.fetchScheduleData();
//   }, date.toString());
// }

function killButtons(p3: any, $: any) {
  let i = p3.module('schedule');
  // Object.assign(i.Vs.CurrentDayPrevNextView.prototype, {
  //   async getCalendar(start: number, end: number) {

  //   }

  //   calendar: this.getCalendar(),

  //   async getNextEvent(date: Date) {

  //   }

  //   async getPrevEvent(date: Date) {

  //   }
  //   navDateNext(k: any) {
  //     p3.loadingIcon('.schedule-list');
  //     $(k.target).closest('.chCal-button').addClass('chCal-state-down');
  //     i.Data.DayViewDate.setDate(i.Data.DayViewDate.getUTCDate() + 1);
  //     i.Us.fetchScheduleData();
  //   },
  // });
  // console.log('iiiiii', i.Vs.CurrentDayPrevNextView.prototype);
  // console.log('uuuuuu', Object.assign({}, p3.Data.Context.attributes));

  let funs = i.Vs.CurrentDayPrevNextView.prototype;
  console.log('uuuuuu', Object.assign({}, funs));

  // const userId = p3.Data.Context.attributes.UserInfo.UserId;
  // const userId = (document.querySelector('#profile-link') as HTMLAnchorElement).href.split('profile/')[1].split('/')[0];
  const userId = '4309545';

  funs.getCalendar = (function () {
    const endpoint = 'https://gannacademy.myschoolapp.com/api/DataDirect/ScheduleList/';
    const startOfYear = 1630209600;
    const endOfYear = 1654747200;
    const query = `?format=json&viewerId=${userId}&personaId=2&viewerPersonaId=2&start=${startOfYear}&end=${endOfYear}`; // eslint-disable-line max-len
    return fetch(endpoint + query).then(r => r.json());
  }());

  // console.log(i.Vs.CurrentDayPrevNextView.prototype.getCalendar);

  // TODO: make next event and previous event use binary search for optimization
  funs.getNextEvt = async function (date: Date) {
    const cal = await this.getCalendar;
    return cal.find((evt: any) => !evt.allDay
      && date.getTime() < new Date(evt.start).getTime());
    // this.getCalendar().then((cal: any[]) => cal.find((evt: any) => !evt.allDay
    //   && date.getTime() < new Date(evt.start).getTime()));
  };

  // console.log('ppp', funs);

  funs.getPrevEvt = async function (date: Date) {
    const cal = await this.getCalendar;
    return cal.slice().reverse().find((evt: any) => !evt.allDay
      && date.getTime() < new Date(evt.start).getTime());
  };

  // overrides
  funs.navDateNext = function (k: any) {
    p3.loadingIcon('.schedule-list');
    $(k.target).closest('.chCal-button').addClass('chCal-state-down');
    // i.Data.DayViewDate.setDate(i.Data.DayViewDate.getUTCDate() + 1);
    i.Data.DayViewDate = this.getNextEvt(i.Data.DayViewDate);
    i.Us.fetchScheduleData();
  };

  funs.navDatePrevious = function (k: any) {
    p3.loadingIcon('.schedule-list');
    $(k.target).closest('.chCal-button').addClass('chCal-state-down');
    // i.Data.DayViewDate.setDate(i.Data.DayViewDate.getUTCDate() - 1);
    i.Data.DayViewDate = this.getPrevEvt(i.Data.DayViewDate);
    i.Us.fetchScheduleData();
  };
}

// function topLevelStopPropagation(selectors: string[]) {
//   // runWithPodiumApp((_p3: any, ...sels) => {
//   //   let observer = new MutationObserver(() => {
//   //     sels.forEach(
//   //       sel => document.querySelector(sel)?.addEventListener('click', evt => evt.stopPropagation()),
//   //     );
//   //   });
//   //   observer.observe(
//   //     document.querySelector('#col-main > div:nth-child(1)'),
//   //     { childList: true, subtree: true },
//   //   );
//   // }, ...selectors);
//   ((...sels: string[]) => {
//     let observer = new MutationObserver(() => {
//       sels.forEach(
//         sel => document.querySelector(sel)?.addEventListener('click', evt => {
//           console.log(document.querySelector(sel));
//           // evt.stopPropagation();
//         }),
//       );
//     });
//     observer.observe(
//       document.querySelector('#col-main > div:nth-child(1)'),
//       { childList: true, subtree: true },
//     );
//   })(...selectors);
// }

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

// async function skipEmptyMain() {
//   const space = await waitForLoad(domQuery);
//   // topLevelStopPropagation(JSON.stringify(['chCal-button-next', 'chCal-button-prev']));
//   topLevelStopPropagation(['.chCal-button-next', '.chCal-button-prev']);
//   addEventListener(space, 'click', async e => {
//     console.log('ahhhhhhhhhh');
//     if (hasParentWithClassName(e.target as HTMLElement, ['chCal-button-next'])) { // if next day was clicked
//       let date = new Date(`${await getDayViewDateString()} 11:59 PM`); // get the date in the schedule at the end of the day
//       // console.log('date', date);
//       let nextEvt = await getNextEvent(date);
//       // console.log('next event', nextEvt);
//       jumpToDay(new Date(nextEvt.start));
//     } else if (hasParentWithClassName(e.target as HTMLElement, ['chCal-button-prev'])) { // if prev day was clicked
//       let date = new Date(`${await getDayViewDateString()} 11:59 PM`); // get the date in the schedule at the end of the day
//       let nextEvt = await getPrevEvent(date);
//       jumpToDay(new Date(nextEvt.start));
//     }
//   });
// }

async function skipEmptyMain() {
  runWithPodiumApp(killButtons);
}

export default registerModule('{42efc8ef-9de0-4eef-8e74-ba18f568b8a3}', {
  name: 'skippy',
  main: skipEmptyMain,
});
