import registerModule from '~/core/module';
import runWithPodiumApp from '~/utils/podiumApp';

function skipEmptyMain() {
  runWithPodiumApp(({ p3, $, Backbone, aP, _ }: any) => {
    let Schedule = p3.module('schedule');
    let MyDayStudent = p3.module('student/myday');

    Schedule.Cs.AllEventsCalendar = Backbone.Collection.extend({
      url() {
        return `${aP}DataDirect/ScheduleList/`;
      },
    });

    // TODO: make next event and previous event use binary search (instead of underscore methods) for optimization
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

    // initializeing the schedule page
    MyDayStudent.Vs.SchedulePerformance.prototype.initialize = function () {
      Schedule.Data.collectionCalendarItem = new Schedule.Cs.Announcements();
      Schedule.Data.collectionCurrentDay = new Schedule.Cs.Schedules();
      Schedule.Data.collectionFullYearCallendar = new Schedule.Cs.AllEventsCalendar();
      Schedule.Data.fetched = Schedule.Data.collectionFullYearCallendar.fetch({ // fetched.done(callback) allows stuff to make sure the data is loaded
        data: {
          start: '1630209600', // begginning of the year in epoch ticks
          end: '1654747200', // end of the year in epoch ticks
          viewerId: p3.Data.Context.get('UserInfo').UserId,
          personaId: p3.Data.Context.getSelectedPersona().Id,
          viewerPersonaId: p3.Data.Context.getSelectedPersona().Id,
        },
      });

      this.template = 'myday/myday.student.schedule.html';
    };

    // loading schedule data for a new date
    let fetchScheduleDataCopy = Schedule.Us.fetchScheduleData;
    Schedule.Us.fetchScheduleData = function () {
      Schedule.Data.fetched.done(() => {
        if (Schedule.Data.DayViewDate === undefined) {
          let nextEvt = Schedule.Us.getNextEvt(new Date());
          if (nextEvt !== undefined) Schedule.Data.DayViewDate = new Date(nextEvt.get('start'));
        }
        fetchScheduleDataCopy();
      });
    };

    Schedule.Vs.CurrentDayPrevNextView.prototype.navDateNext = function (k: any) {
      p3.loadingIcon('.schedule-list');
      $(k.target).closest('.chCal-button').addClass('chCal-state-down');
      Schedule.Data.DayViewDate.setDate(Schedule.Data.DayViewDate.getUTCDate() + 1);
      let nextEvt = Schedule.Us.getNextEvt(Schedule.Data.DayViewDate);
      // console.log('found next'); // for timing
      if (nextEvt !== undefined) Schedule.Data.DayViewDate = new Date(nextEvt.get('start'));
      Schedule.Us.fetchScheduleData();
    };

    Schedule.Vs.CurrentDayPrevNextView.prototype.navDatePrevious = function (k: any) {
      p3.loadingIcon('.schedule-list');
      $(k.target).closest('.chCal-button').addClass('chCal-state-down');
      // Schedule.Data.DayViewDate.setDate(Schedule.Data.DayViewDate.getUTCDate() - 1);
      let prevEvt = Schedule.Us.getPrevEvt(Schedule.Data.DayViewDate);
      // console.log('found prev'); // for timing
      if (prevEvt !== undefined) Schedule.Data.DayViewDate = new Date(prevEvt.get('start'));
      Schedule.Us.fetchScheduleData();
    };
  });
}

export default registerModule('{42efc8ef-9de0-4eef-8e74-ba18f568b8a3}', {
  name: 'skippy',
  init: skipEmptyMain,
});
