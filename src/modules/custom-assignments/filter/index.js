import { nodeListToArray } from '../../../utils/dom';
import { compareDate, getDaysInMonth, getMonthFromString } from '../../../utils/date';
import filterStatus from './filter-status';
import filterClasses from './filter-classes';

const displayTypeFilters = {
  ASSIGNED: 'assigned',
  DUE: 'due',
  ACTIVE: 'active',
};

function isAssignmentInRange(assignment, beginString, endString, filterType) {

  const beginDate = new Date(beginString);
  const endDate = new Date(endString);
  beginDate.setFullYear(new Date().getFullYear());
  endDate.setFullYear(new Date().getFullYear());

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
  const dateString = document.getElementById('small-date-display-label').innerText.trim();
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
  const dateString = document.getElementById('small-date-display-label').innerText.trim();
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
  const dateString = document.getElementById('small-date-display-label').innerText.trim();
  const [month, year] = dateString.split(',');
  const lastDate = getDaysInMonth(getMonthFromString(month));

  const monthStartString = `${month} 1, ${year}`;
  const monthEndString = `${month} ${lastDate}, ${year}`;
  return isAssignmentInRange(assignment, monthStartString, monthEndString, filterType);
}
function getAssignmentDisplayTypeFilter() {
  // one of [assigned, active, due]
  // TODO: work with mobile layout
  const activeFilter = document.getElementsByClassName('assignmentDisplayTypeFilter active')[0];
  return activeFilter.innerText.toLowerCase();
}

function getDateFilterFn() {
  const onlyViews = btn => btn.id.indexOf('view') > -1;
  const findActive = btn => btn.className.indexOf('active') > -1;

  const filterButtons = nodeListToArray(document.getElementsByClassName('views-button')[0].children);

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

  const [activeRangeBtn] = document.getElementsByClassName('btn btn-default dropdown-toggle active');
  if (activeRangeBtn) {
    return rangeFilter;
  }

  return filterMap[activeFilter];
}

// if filterAssignment returns true, assignment passes filter
export default function filterAssignment(assignment) {
  return getDateFilterFn()(assignment, getAssignmentDisplayTypeFilter()) &&
    filterStatus(assignment) &&
    filterClasses(assignment);
}
