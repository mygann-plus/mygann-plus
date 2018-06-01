import autoCloseDetailStatus from './modules/auto-close-detail-status';
import archiveAll from './modules/archive-all';
import classEndingTime from './modules/class-ending-time';
import coursesFilter from './modules/courses-filter';
import filterWebsiteMainSearch from './modules/filter-website-main-search';
import freeBlock from './modules/free-block';
import gradeChart from './modules/grade-chart';
import gradeSummary from './modules/grade-summary';
import highlightCurrentClass from './modules/highlight-current-class';
import improveGrades from './modules/improve-grades';
import inlineChangeStatus from './modules/inline-change-status';
import messagePreview from './modules/message-preview';
import nextGradedCourse from './modules/next-graded-course';
import options from './modules/options';
import searchClassesMenu from './modules/search-classes-menu';
import toggleCompleted from './modules/toggle-completed';

/* eslint-disable quote-props */

const MODULE_MAP = {
  '#': [searchClassesMenu, messagePreview, options], // universal modules
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
