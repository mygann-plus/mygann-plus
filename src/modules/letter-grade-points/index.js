import registerModule from '~/module';

import { createElement, insertCss, waitForOne } from '~/utils/dom';
import log from '~/utils/log';
import { fetchApi } from '~/utils/fetch';

import {
  addProgressDialogListener,
  getOpenCourseId,
  getActiveMarkingPeriodId,
  sanitizeAssignmentTitle,
} from '~/shared/progress';
import { getTableRowColumnContent } from '~/shared/table';

import style from './style.css';

const selectors = {
  label: style.locals.label,
};

// Get all assignments from course
async function getAssignments(courseId) {
  const markingPeriodId = await getActiveMarkingPeriodId();
  const endpoint = '/api/datadirect/GradeBookPerformanceAssignmentStudentList/';
  const query = `?sectionId=${courseId}&markingPeriodId=${markingPeriodId}&studentUserId=4109775`;
  return fetchApi(endpoint + query);
}

// Assigned and due are stored as MM/DD/YY HH:MM PM/AM, displayed as MM/DD
function isEqualDate(longDate, shortDate) {
  return longDate.startsWith(shortDate);
}

async function generatePointsLabel(gradeElem, assignments) {
  const assignmentRow = gradeElem.closest('tr');
  const name = getTableRowColumnContent(assignmentRow, 'Assignment');
  const assigned = getTableRowColumnContent(assignmentRow, 'Assigned');
  const due = getTableRowColumnContent(assignmentRow, 'Due');

  const assignmentData = assignments.find(assignment => {
    return sanitizeAssignmentTitle(assignment.AssignmentShortDescription) === name
      && isEqualDate(assignment.DateAssigned, assigned)
      && isEqualDate(assignment.DateDue, due);
  });

  if (!assignmentData) {
    return log(
      'error',
      'Cannot match assignment data in letter-grade-points',
      gradeElem,
      assignments,
    );
  }

  const max = assignmentData.MaxPoints;
  const earned = (max * assignmentData.AssignmentPercentage) / 100;

  const label = (
    <span className={selectors.label}>
      ({earned}/{max})
    </span>
  );

  return label;

}

function isLetterGrade(gradeElem) {
  const grade = gradeElem.firstChild.textContent;
  return !!grade.toLowerCase().match(/[a-z]/);
}

const domQuery = () => document.querySelectorAll('[data-heading="Points"] h4');

async function insertPoints(unloaderContext) {
  const gradeElems = await waitForOne(domQuery);
  const letterGradeElems = Array.from(gradeElems)
    .filter(isLetterGrade);

  if (!letterGradeElems.length) {
    return;
  }

  const openCourseId = getOpenCourseId();
  const assignments = await getAssignments(openCourseId);

  for (const gradeElem of letterGradeElems) {
    const label = await generatePointsLabel(gradeElem, assignments);
    gradeElem.appendChild(label);
    unloaderContext.addRemovable(label);
  }
}

async function letterGradePoints(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  addProgressDialogListener(() => {
    insertPoints(unloaderContext);
  }, unloaderContext);
}

export default registerModule('{e8c4fe63-4ca7-4a1b-ac96-3675aa16d3db}', {
  name: 'Letter Grade Points',
  description: 'See the earned and total amount of points on a letter graded assignment',
  main: letterGradePoints,
});
