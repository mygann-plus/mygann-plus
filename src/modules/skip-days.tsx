import registerModule from '~/core/module';
import { createElement } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
// import runWithPodiumApp, { podiumApp } from '~/utils/podiumApp';
import runWithPodiumApp from '~/utils/podiumApp';

// function jumpToDay(date: Date) {
//   const script = (
//     <script>
//       (function () &#123;
//         const sched = p3.module(`schedule`);
//         sched.Data.DayViewDate = new Date({ date.getTime() });
//         sched.Us.fetchScheduleData();
//       &#125;());
//     </script>
//   );
//   console.log(script);
//   document.head.appendChild(script);
// }

function jumpToDay(date: Date) {
  // the following does not work because the returned function literally says the word date with that set as a closure to the upper parameter, so when placed inside the script it loses that closure
  /* return function (p3: podiumApp) {
    const sched = p3.module('schedule');
    sched.Data.DayViewDate = date;
    sched.Us.fetchScheduleData();
  }; */

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  // return new Function('p3', `
  //   const sched = p3.module('schedule');
  //   sched.Data.DayViewDate = new Date(${date});
  //   sched.Us.fetchScheduleData();
  // `);
  runWithPodiumApp(`
    const sched = p3.module('schedule');
    sched.Data.DayViewDate = new Date(${date.getTime()});
    sched.Us.fetchScheduleData();
  `);
}

async function skipEmptyMain() {
  jumpToDay(new Date('10/3/2021'));
}

export default registerModule('{42efc8ef-9de0-4eef-8e74-ba18f568b8a3}', {
  name: 'skippy',
  main: skipEmptyMain,
});
