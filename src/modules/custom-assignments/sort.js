import { compareDate } from '../../utils/date';

const classSort = (assignment, comparedAssignment) => (
  // alphabetical comparison
  comparedAssignment.children[0].innerText.localeCompare(assignment.className)
);
const typeSort = () => -1; // private type is always at bottom
const detailsSort = (assignment, comparedAssignment) => {
  const detailsElem = comparedAssignment.children[2];
  let details;
  if (detailsElem.children[0]) {
    details = detailsElem.children[0].innerText;
  } else {
    details = detailsElem.innerText;
  }
  return details.localeCompare(assignment.details);
};
const assignSort = (assignment, comparedAssignment) => (
  compareDate(new Date(comparedAssignment.children[3].innerText), new Date(assignment.assign))
);
const dueSort = (assignment, comparedAssignment) => (
  compareDate(new Date(comparedAssignment.children[4].innerText), new Date(assignment.due))
);
const statusSort = (assignment, comparedAssignment) => {

  const statuses = [
    'Overdue',
    'In Progress',
    'Completed',
    'Graded',
    'To Do',
  ];

  const comparedStatus = comparedAssignment.children[5].children[0].children[0].children[0].innerText;
  const assignmentIndex = statuses.indexOf(assignment.status);
  const comparedAssignmentIndex = statuses.indexOf(comparedStatus);

  if (assignmentIndex < comparedAssignmentIndex) {
    return 1;
  } else if (assignmentIndex > comparedAssignmentIndex) {
    return -1;
  } else {
    return 0;
  }
};


function invertSortFn(sortFn) {
  return function(a, b) {
    const num = sortFn(a, b);
    if (num === -1) {
      return 1;
    } else if (num === 1) {
      return -1;
    }
    return 0;
  };
}

export default function getSortFnFromTable() {

  const sortMap = {
    groupname: classSort,
    assignment_type: typeSort,
    short_description: detailsSort,
    date_assigned: assignSort,
    date_due: dueSort,
    assignment_status: statusSort,
  };

  const sortElem = document.getElementsByClassName('assignment-table-sort sort-active')[0];
  const sortType = sortElem.getAttribute('data-sort');
  const sortFn = sortMap[sortType];
  const isInverted = sortElem.children[0].className === 'sort-icon p3icon-sortUp';

  return isInverted ? invertSortFn(sortFn) : sortFn;
}
