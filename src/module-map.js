import autoCloseDetailStatus from './modules/auto-close-detail-status';
import autofocusSiteSearch from './modules/autofocus-site-search';
import archiveAll from './modules/archive-all';
import classEndingTime from './modules/class-ending-time';
import coursesFilter from './modules/courses-filter';
import filterWebsiteMainSearch from './modules/filter-website-main-search';
import freeBlock from './modules/free-block';
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
import userMenuLinks from './modules/user-menu-links'; // eslint-disable-line import/no-cycle
import fixDividers from './modules/fix-dividers';
import installNotification from './modules/install-notification';
import fixArchiveHighlight from './modules/fix-archive-highlight';
import markAsRead from './modules/mark-as-read';
import hideNonacademicClasses from './modules/hide-nonacademic-classes';
import teacherOffices from './modules/teacher-offices';
import markAllAsRead from './modules/mark-all-as-read';
import messageConversationControls from './modules/message-conversation-archive';
import gradeNotifications from './modules/grade-notifications';
import calculateGradePercentage from './modules/calculate-grade-percentage';
import collapseAssignmentSections from './modules/collapse-assignment-sections';
import dueSoon from './modules/due-soon';
import nameQuiz from './modules/name-quiz';
import hideForms from './modules/hide-forms';
import taskDetail from './modules/task-detail';
import myDayShortcut from './modules/my-day-shortcut';
import blockLength from './modules/block-length';
import classEmail from './modules/class-email';
import fixSemesterSwitch from './modules/fix-semester-switch';
import fullYearAssignments from './modules/full-year-assignments';
import theme from './modules/theme';
import extreme from './modules/extreme';
import progressAssignmentDetails from './modules/progress-assignment-details';
import serveryMenu from './modules/servery-menu';
import scheduleArrowNavigation from './modules/schedule-arrow-navigation';
import admin from './modules/admin';
import semesterSwitcher from './modules/semester-switcher';
import hideCommunityServiceAssignment from './modules/hide-community-service-assignment';
import autocollapseProgressBoxes from './modules/autocollapse-progress-boxes';

const MODULE_MAP = {
  '#': [
    hideNonacademicClasses,
    searchClassesMenu,
    messageNotifications,
    userMenuLinks, // options dialog and about
    favorites,
    fixDividers,
    installNotification,
    gradeNotifications,
    hideForms,
    myDayShortcut,
    theme,
    autofocusSiteSearch,
  ], // universal modules
  '#login': [oneClickLogin],
  '#assignmentdetail': [autoCloseDetailStatus],
  '#studentmyday/assignment-center': [
    inlineChangeStatus,
    hideCompleted,
    inlineAssignmentGrade,
    resizeAssignmentsToolbar,
    dueSoon,
    taskDetail,
    fixSemesterSwitch,
    extreme,
  ],
  '#taskdetail': [taskDetail],
  '#studentmyday/schedule': [
    freeBlock,
    highlightCurrentClass,
    serveryMenu,
    blockLength,
    classEndingTime,
    comingUp,
    scheduleArrowNavigation,
  ],
  '#myday/schedule-performance': [classEndingTime],
  '#studentmyday/progress': [
    coursesFilter,
    nextGradedCourse,
    calculateGradePercentage,
    collapseAssignmentSections,
    fullYearAssignments,
    progressAssignmentDetails,
    semesterSwitcher,
    autocollapseProgressBoxes,
  ],
  '#message': [archiveAll],
  '#message/inbox': [markAllAsRead, markAsRead, fixArchiveHighlight],
  '#message/archive': [fixArchiveHighlight],
  '#message/compose': [exitCompose],
  '#message/conversation': [linkifyMessageText, messageConversationControls],
  '#directory/800': [teacherOffices],
  '#searchresults/summary': [filterWebsiteMainSearch],
  '#academicclass': [classEmail, nameQuiz],
  '#communitypage': [nameQuiz],
  '#myschedule': [dayScheduleButton],
  '#admin': [admin],

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
  '#directory/800': 'Faculty & Staff Directory',
  '#searchresults/summary': 'Search Results Summary',
  '#academicclass': 'Academic Class Page',
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
