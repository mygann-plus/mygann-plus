import autoCloseDetailStatus from './modules/auto-close-detail-status';
import inlineChangeStatus from './modules/inline-change-status';
import toggleCompleted from './modules/toggle-completed';
import highlightCurrentClass from './modules/highlight-current-class';
import freeBlock from './modules/free-block';
import gradeSummary from './modules/grade-summary';
import archiveAll from './modules/archive-all';
import improveGrades from './modules/improve-grades';
import coursesSearch from './modules/courses-search';

/* eslint-disable quote-props */

const MODULE_MAP = {
  'assignmentdetail': [autoCloseDetailStatus],
  'studentmyday/assignment-center': [inlineChangeStatus, toggleCompleted],
  'studentmyday/schedule': [highlightCurrentClass, freeBlock],
  'studentmyday/progress': [gradeSummary, coursesSearch, improveGrades],
  'message': [archiveAll],
};

const SECTION_MAP = {
  'assignmentdetail': 'Assignment Detail',
  'studentmyday/assignment-center': 'Assignment Center',
  'studentmyday/schedule': 'Schedule',
  'studentmyday/progress': 'Progress',
  'message': 'Messages',
};

/* eslint-enable quote-props */

export { MODULE_MAP, SECTION_MAP };
