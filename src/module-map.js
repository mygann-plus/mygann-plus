import autoCloseDetailStatus from './modules/auto-close-detail-status';
import archiveAll from './modules/archive-all';
import classEndingTime from './modules/class-ending-time';
import coursesFilter from './modules/courses-filter';
import filterWebsiteMainSearch from './modules/filter-website-main-search';
import freeBlock from './modules/free-block';
import gradeSummary from './modules/grade-summary';
import highlightCurrentClass from './modules/highlight-current-class';
import improveGrades from './modules/improve-grades';
import inlineChangeStatus from './modules/inline-change-status';
import messageNotifications from './modules/message-notifications';
import nextGradedCourse from './modules/next-graded-course';
import optionsDialog from './modules/options-dialog';
import searchClassesMenu from './modules/search-classes-menu';
import hideCompleted from './modules/hide-completed';
import comingUp from './modules/coming-up';
import dayScheduleButton from './modules/day-schedule-button';
import favorites from './modules/favorites';
import inlineAssignmentGrade from './modules/inline-assignment-grade';
import oneClickLogin from './modules/one-click-login';
import exitCompose from './modules/exit-compose';

const MODULE_MAP = {
  '#': [searchClassesMenu, messageNotifications, optionsDialog, favorites], // universal modules
  '#login': [oneClickLogin],
  '#assignmentdetail': [autoCloseDetailStatus],
  '#studentmyday/assignment-center': [
    inlineChangeStatus,
    hideCompleted,
    inlineAssignmentGrade,
  ],
  '#studentmyday/schedule': [highlightCurrentClass, freeBlock, classEndingTime, comingUp],
  '#studentmyday/progress': [
    gradeSummary,
    coursesFilter,
    improveGrades,
    nextGradedCourse,
  ],
  '#message': [archiveAll],
  '#message/compose': [exitCompose],
  '#searchresults/summary': [filterWebsiteMainSearch],
  '#myschedule': [dayScheduleButton],

  __proto__: null, // use as map
};

const SECTION_MAP = {
  '#': 'Entire Site',
  '#login': 'Login',
  '#assignmentdetail': 'Assignment Detail',
  '#studentmyday/assignment-center': 'Assignment Center',
  '#studentmyday/schedule': 'Schedule',
  '#studentmyday/progress': 'Progress',
  '#message': 'Messages',
  '#message/compose': 'Message Compose',
  '#searchresults/summary': 'Search Results Summary',
  '#myschedule': 'Month & Week Schedule',

  __proto__: null,
};

export function modulesForHash(hash) {
  const modules = new Set();
  for (const section in MODULE_MAP) {
    if (hash.startsWith(section)) {
      for (const module of MODULE_MAP[section]) {
        modules.add(module);
      }
    }
  }
  return modules;
}

export { MODULE_MAP, SECTION_MAP };
