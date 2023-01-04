/* eslint no-underscore-dangle: ["warn", { "allow": ["_currentMainView"] }] */
import registerModule from '~/core/module';
import runWithPodiumApp from '~/utils/podium-app';

// https://src-e1.myschoolapp.com/1.52.22068.10/src/modules/sis/shared/schedule.js

function updateExistingView() {
  // if the page is already schedule, then the methods on that schedule view need to be changed in addition to the prototype
  runWithPodiumApp(({ p3 }) => {
    if (p3._currentMainView.options?.page === 'schedule') {
      let schedulePerformance = p3._currentMainView.Containers.Main.data('views')[0];
      let currentDayPrevNextView = schedulePerformance.Containers.Main.data('views')[0];
      const proto = Object.getPrototypeOf(currentDayPrevNextView);
      currentDayPrevNextView.navDateNext = proto.navDateNext;
      currentDayPrevNextView.navDatePrevious = proto.navDatePrevious;
      currentDayPrevNextView.delegateEvents(); // updates the events with the new functions
      p3.module('schedule').Us.waitForCalendar(); // fetch the full calendar now so it doesn't need to take time when the user changes the day
    }
  });
}

function skipEmptyMain() {
  runWithPodiumApp(({ p3, $, Backbone, aP, _ }) => {
    let Schedule = p3.module('schedule');

    Schedule.Cs.AllEventsCalendar = Backbone.Collection.extend({
      url() {
        return `${aP}DataDirect/ScheduleList/`;
      },
    });

    Schedule.Us.waitForCalendar = function (callback: () => void) {
      if (Schedule.Data.fetched === undefined) {
        Schedule.Data.collectionFullYearCallendar = new Schedule.Cs.AllEventsCalendar();
        Schedule.Data.fetched = Schedule.Data.collectionFullYearCallendar.fetch({ // fetched.done(callback) allows stuff to make sure the data is loaded
          data: {
            // new start = 1661776200
            // new end =   1686931560
            start: '1630209600', // begginning of the year in epoch ticks
            end: '1654747200', // end of the year in epoch ticks
            viewerId: p3.Data.Context.get('UserInfo').UserId,
            personaId: p3.Data.Context.getSelectedPersona().Id,
            viewerPersonaId: p3.Data.Context.getSelectedPersona().Id,
          },
        });
      }
      Schedule.Data.fetched.done(callback);
    };

    // TODO: make next event and previous event use binary search (instead of underscore methods) for optimization. getNext generally takes under 1 ms and getPrev generally under 2 // note while going through todos much much later: if it takes under 2 ms why would you optimize it?
    Schedule.Us.getNextEvt = function (date: Date) {
      return Schedule.Data.collectionFullYearCallendar.find(
        (evt: any) => !evt.get('allDay') && date.getTime() < new Date(evt.get('end')).getTime(),
      );
    };

    Schedule.Us.getPrevEvt = function (date: Date) {
      return Schedule.Data.collectionFullYearCallendar.at(
        _.findLastIndex( // _.findLastIndex is not in proxied in Collection in Backbone 1.1.2, nor is mixin to do it here. If they ever update backbone, yay
          Schedule.Data.collectionFullYearCallendar.models,
          (evt: any) => !evt.get('allDay') && date.getTime() > new Date(evt.get('start')).getTime(),
        ),
      );
    };

    // overrides

    // loading schedule data for a new date
    Schedule.Us.fetchScheduleDataOld = Schedule.Us.fetchScheduleData;
    Schedule.Us.fetchScheduleData = function () {
      Schedule.Us.waitForCalendar(() => {
        if (Schedule.Data.DayViewDate === undefined) {
          let nextEvt = Schedule.Us.getNextEvt(new Date());
          if (nextEvt !== undefined) Schedule.Data.DayViewDate = new Date(nextEvt.get('start'));
        }
        Schedule.Us.fetchScheduleDataOld();
      });
    };

    const prevNextView = Schedule.Vs.CurrentDayPrevNextView.prototype;

    prevNextView.navDateNextOld = prevNextView.navDateNext;
    prevNextView.navDateNext = function (k: any) {
      p3.loadingIcon('.schedule-list');
      $(k.target).closest('.chCal-button').addClass('chCal-state-down');
      Schedule.Data.DayViewDate.setDate(Schedule.Data.DayViewDate.getUTCDate() + 1);
      Schedule.Us.waitForCalendar(() => {
        let nextEvt = Schedule.Us.getNextEvt(Schedule.Data.DayViewDate);
        // console.log('found next'); // for timing
        if (nextEvt !== undefined) Schedule.Data.DayViewDate = new Date(nextEvt.get('start'));
        Schedule.Us.fetchScheduleData();
      });
    };

    prevNextView.navDatePreviousOld = prevNextView.navDatePrevious;
    prevNextView.navDatePrevious = function (k: any) {
      p3.loadingIcon('.schedule-list');
      $(k.target).closest('.chCal-button').addClass('chCal-state-down');
      Schedule.Us.waitForCalendar(() => {
        let prevEvt = Schedule.Us.getPrevEvt(Schedule.Data.DayViewDate);
        // console.log('found prev'); // for timing
        if (prevEvt !== undefined) Schedule.Data.DayViewDate = new Date(prevEvt.get('start'));
        else Schedule.Data.DayViewDate.setDate(Schedule.Data.DayViewDate.getUTCDate() - 1);
        Schedule.Us.fetchScheduleData();
      });
    };
  });
  updateExistingView();
}

function unloadSkipDays() {
  runWithPodiumApp(({ p3 }) => {
    let Schedule = p3.module('schedule');
    let prevNextView = Schedule.Vs.CurrentDayPrevNextView.prototype;
    Schedule.Us.fetchScheduleData = Schedule.Us.fetchScheduleDataOld;
    prevNextView.navDateNext = prevNextView.navDateNextOld;
    prevNextView.navDatePrevious = prevNextView.navDatePreviousOld;
  });
  updateExistingView();
}

export default registerModule('{42efc8ef-9de0-4eef-8e74-ba18f568b8a3}', {
  name: 'Smart Schedule',
  description: `
  Automatically switches schedule to next date with classes. 
  (For example, schedule will display Monday's classes when 
  checked on Saturday night)`,
  init: skipEmptyMain,
  unload: unloadSkipDays,
  stayLoaded: true,
});
