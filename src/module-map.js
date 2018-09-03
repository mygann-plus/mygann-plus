import autoCloseDetailStatus from './modules/auto-close-detail-status';
import archiveAll from './modules/archive-all';
import classEndingTime from './modules/class-ending-time';
import coursesFilter from './modules/courses-filter';
import filterWebsiteMainSearch from './modules/filter-website-main-search';
import freeBlock from './modules/free-block';
import gradeSummary from './modules/grade-summary';
import highlightCurrentClass from './modules/highlight-current-class';
import inlineChangeStatus from './modules/inline-change-status';
import messageNotifications from './modules/message-notifications';
import nextGradedCourse from './modules/next-graded-course';
import searchClassesMenu from './modules/search-classes-menu';
import hideCompleted from './modules/hide-completed';
import comingUp from './modules/coming-up';
import dayScheduleButton from './modules/day-schedule-button';
import favorites from './modules/favorites';
import inlineAssignmentGrade from './modules/inline-assignment-grade';
import oneClickLogin from './modules/one-click-login';
import exitCompose from './modules/exit-compose';
import resizeAssignmentsToolbar from './modules/resize-assignments-toolbar';
import linkifyMessageText from './modules/linkify-message-text';
import userMenuLinks from './modules/user-menu-links';
import fixDividers from './modules/fix-dividers';
import installNotification from './modules/install-notification';
import fixArchiveHighlight from './modules/fix-archive-highlight';
import markAsRead from './modules/mark-as-read';
import hideTasksAfterDue from './modules/hide-tasks-after-due';

const MODULE_MAP = {
  '#': [
    searchClassesMenu,
    messageNotifications,
    userMenuLinks, // options dialog and about
    favorites,
    fixDividers,
    installNotification,
  ], // universal modules
  '#login': [oneClickLogin],
  '#assignmentdetail': [autoCloseDetailStatus],
  '#studentmyday/assignment-center': [
    inlineChangeStatus,
    hideCompleted,
    inlineAssignmentGrade,
    resizeAssignmentsToolbar,
    hideTasksAfterDue,
  ],
  '#studentmyday/schedule': [highlightCurrentClass, freeBlock, classEndingTime, comingUp],
  '#studentmyday/progress': [
    gradeSummary,
    coursesFilter,
    nextGradedCourse,
  ],
  '#message': [archiveAll, fixArchiveHighlight],
  '#message/inbox': [markAsRead],
  '#message/compose': [exitCompose],
  '#message/conversation': [linkifyMessageText],
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
  '#message/inbox': 'Messages Inbox',
  '#message/compose': 'Message Compose',
  '#message/conversation': 'Message Conversation',
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
