import registerModule from '~/module';

import { waitForLoad, insertCss } from '~/utils/dom';
import { compareDate, getDaysInMonth, getMonthFromString } from '~/utils/date';

import { isTask, addAssignmentTableMutationObserver } from '~/shared/assignments-center';
import { getTableRowColumnContent } from '~/shared/table';

import style from './style.css';

const selectors = {
  hiddenTask: style.locals['hidden-task'],
};

const displayTypeFilters = {
  ASSIGNED: 'assigned',
  DUE: 'due',
  ACTIVE: 'active',
};

function isAssignmentInRange(assignment, beginString, endString, filterType) {

  const beginDate = new Date(beginString);
  const endDate = new Date(endString);

  const beginTime = beginDate.getTime();
  const endTime = endDate.getTime();
  const assignTime = new Date(assignment.assign).getTime();
  const dueTime = new Date(assignment.due).getTime();

  switch (filterType) {
    case displayTypeFilters.ASSIGNED:
      return (assignTime >= beginTime && assignTime <= endTime);
    case displayTypeFilters.DUE:
      return (dueTime >= beginTime && dueTime <= endTime);
    case displayTypeFilters.ACTIVE:
      return (
        // assign/due date is in range
        (assignTime >= beginTime && assignTime <= endTime) ||
        (dueTime >= beginTime && dueTime <= endTime) ||
        // or range is between assign and due date
        (assignTime <= beginTime && dueTime >= endTime)
      );
    default:
      return true;
  }
}

function dayFilter(assignment, filterType) {
  const dateString = document.getElementById('small-date-display-label').textContent.trim();
  let date = new Date(dateString);
  if (!dateString) {
    // date isn't shown, therefore today is selected
    // TODO: Confirm that this is true (switching from grid view?)
    date = new Date();
    date.setMinutes(0);
    date.setHours(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }
  switch (filterType) {
    case displayTypeFilters.ASSIGNED:
      return new Date(assignment.assign).getTime() === date.getTime();
    case displayTypeFilters.ACTIVE:
      return (
        // current day is between assigned day and due day
        compareDate(new Date(assignment.due), date) > -1 &&
        compareDate(new Date(assignment.assign), date) < 1
      );
    case displayTypeFilters.DUE:
      return new Date(assignment.due).getTime() === date.getTime();
    default:
      return true;
  }
}
function rangeFilter(assignment, filterType) {
  // TODO: account for if week isn't shown
  const dateString = document.getElementById('small-date-display-label').textContent.trim();
  const rangeString = dateString.split(',')[0];
  const twoMonthsRegex = /-\s[A-Z]/; // tests if string contains two months
  const isTwoMonths = twoMonthsRegex.test(rangeString);

  let beginString;
  let endString;
  if (isTwoMonths) {
    [beginString, endString] = rangeString.split(' -');
  } else {
    [beginString] = rangeString.split(' -');
    endString = rangeString.split(' ')[0] + rangeString.split(' -')[1];
  }

  return isAssignmentInRange(assignment, beginString, endString, filterType);
}
function monthFilter(assignment, filterType) {
  // TODO: account for if month isn't shown
  const dateString = document.getElementById('small-date-display-label').textContent.trim();
  const [month, year] = dateString.split(',');
  const lastDate = getDaysInMonth(getMonthFromString(month));

  const monthStartString = `${month} 1, ${year}`;
  const monthEndString = `${month} ${lastDate}, ${year}`;
  return isAssignmentInRange(assignment, monthStartString, monthEndString, filterType);
}
function getAssignmentDisplayTypeFilter() {
  // one of [assigned, active, due]
  // TODO: work with mobile layout
  const activeFilter = document.querySelector('.assignmentDisplayTypeFilter.active');
  return activeFilter.textContent.toLowerCase().trim();
}

function getDateFilterFn() {
  const onlyViews = btn => btn.id.indexOf('view') > -1;
  const findActive = btn => btn.className.indexOf('active') > -1;

  const filterButtons = Array.from(document.querySelectorAll('.views-button > *'));

  // id is in format "filtername-view"
  const activeFilterId = filterButtons
    .filter(onlyViews) // remove range, which is handled separately
    .filter(findActive)[0].id;
  const activeFilter = activeFilterId.split('-')[0];

  const filterMap = {
    day: dayFilter,
    week: rangeFilter, // week string is formatted like range
    month: monthFilter,
  };

  const activeRangeBtn = document.querySelector('.btn.btn-default.dropdown-toggle.active');
  if (activeRangeBtn) {
    return rangeFilter;
  }

  return filterMap[activeFilter];
}

function isComplete(assignment) {
  // only filter completed statuses
  return assignment.status === 'Completed';
}

// if filterAssignment returns true, assignment passes filter
function filterAssignment(assignment) {
  return getDateFilterFn()(assignment, getAssignmentDisplayTypeFilter());
}

function getTaskObject(taskRow) {
  return {
    assign: getTableRowColumnContent(taskRow, 'Assign'),
    due: getTableRowColumnContent(taskRow, 'Due'),
    status: getTableRowColumnContent(taskRow, 'Status'),
  };
}

const domQuery = () => (
  document.querySelector('#assignment-center-assignment-items tr') &&
  document.querySelector('.views-button > *')
);

async function hideTasks(options) {
  await waitForLoad(domQuery);

  const assignments = Array.from(document.querySelectorAll('#assignment-center-assignment-items tr'));
  const tasks = assignments.filter(isTask);
  for (const task of tasks) {
    const taskObj = getTaskObject(task);
    if (!filterAssignment(taskObj)) {
      if (options.onlyCompleted && !isComplete(taskObj)) {
        continue;
      }
      task.classList.add(selectors.hiddenTask);
    }
  }
}

async function hideTasksAfterDue(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  hideTasks(opts);

  const observer = await addAssignmentTableMutationObserver(() => hideTasks(opts));
  unloaderContext.addRemovable(observer);
}

function unloadHideTasksAfterDue() {
  const hiddenTasks = document.querySelectorAll(`.${selectors.hiddenTask}`);
  for (const task of hiddenTasks) {
    task.classList.remove(selectors.hiddenTask);
  }
}

export default registerModule('{3928713d-1837-4f0a-a0c8-e5d9b1388fd9}', {
  name: 'Hide Tasks After Due',
  description: 'Hide "My Tasks" after their due date, or based on the selected date(s) in the assignment center', // eslint-disable-line max-len
  main: hideTasksAfterDue,
  unload: unloadHideTasksAfterDue,
  suboptions: {
    onlyCompleted: {
      name: 'Only Hide Completed Tasks',
      type: 'boolean',
      defaultValue: true,
    },
  },
});
