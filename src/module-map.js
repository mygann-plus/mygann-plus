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
import messagePreview from './modules/message-preview';
import nextGradedCourse from './modules/next-graded-course';
import options from './modules/options';
import searchClassesMenu from './modules/search-classes-menu';
import toggleCompleted from './modules/toggle-completed';
import comingUp from './modules/coming-up';
import customAssignments from './modules/custom-assignments';
import dayScheduleButton from './modules/day-schedule-button';
import favorites from './modules/favorites';
import inlineAssignmentGrade from './modules/inline-assignment-grade';
import oneClickLogin from './modules/one-click-login';
import messageDraft from './modules/message-draft';

const MODULE_MAP = {
  '#': [searchClassesMenu, messagePreview, options, favorites], // universal modules
  '#login': [oneClickLogin],
  '#assignmentdetail': [autoCloseDetailStatus],
  '#studentmyday/assignment-center': [
    inlineChangeStatus,
    toggleCompleted,
    customAssignments,
    inlineAssignmentGrade,
  ],
  '#studentmyday/schedule': [highlightCurrentClass, freeBlock, classEndingTime, comingUp],
  '#studentmyday/progress': [
    gradeSummary,
    coursesFilter,
    improveGrades,
    nextGradedCourse,
  ],
  '#message': [archiveAll, messageDraft],
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
  '#searchresults/summary': 'Search Results Summary',
  '#myschedule': 'Month & Week Schedule',

  __proto__: null,
};

export { MODULE_MAP, SECTION_MAP };
