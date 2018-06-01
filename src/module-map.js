import autoCloseDetailStatus from './modules/auto-close-detail-status';
import inlineChangeStatus from './modules/inline-change-status';
import toggleCompleted from './modules/toggle-completed';
import highlightCurrentClass from './modules/highlight-current-class';
import freeBlock from './modules/free-block';
import gradeSummary from './modules/grade-summary';
import archiveAll from './modules/archive-all';
import improveGrades from './modules/improve-grades';
import coursesFilter from './modules/courses-filter';
import nextGradedCourse from './modules/next-graded-course';
import searchClassesMenu from './modules/search-classes-menu';
import filterWebsiteMainSearch from './modules/filter-website-main-search';
import classEndingTime from './modules/class-ending-time';
import messagePreview from './modules/message-preview';
import beezratHashem from './modules/beezerat-hashem';
import gradeChart from './modules/grade-chart';

/* eslint-disable quote-props */

const MODULE_MAP = {
  '#': [searchClassesMenu, messagePreview], // universal modules
  '#assignmentdetail': [autoCloseDetailStatus],
  '#studentmyday/assignment-center': [inlineChangeStatus, toggleCompleted],
  '#studentmyday/schedule': [highlightCurrentClass, freeBlock, classEndingTime],
  '#studentmyday/progress': [
    gradeSummary,
    coursesFilter,
    improveGrades,
    nextGradedCourse,
    gradeChart,
  ],
  '#message': [archiveAll],
  '#searchresults/summary': [filterWebsiteMainSearch],
};

const SECTION_MAP = {
  '#': 'Entire Site',
  '#assignmentdetail': 'Assignment Detail',
  '#studentmyday/assignment-center': 'Assignment Center',
  '#studentmyday/schedule': 'Schedule',
  '#studentmyday/progress': 'Progress',
  '#message': 'Messages',
  '#searchresults/summary': 'Search Results Summary',
};

/* eslint-enable quote-props */

export { MODULE_MAP, SECTION_MAP };
