import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { createElement, insertCss, waitForOne } from '~/utils/dom';
import log from '~/utils/log';
import { fetchApi } from '~/utils/fetch';

import {
  addProgressDialogListener,
  getOpenCourseId,
  getActiveMarkingPeriodId,
  sanitizeAssignmentTitle,
  assignmentHasRubric,
  getAssignmentDataFromRow,
  observeCoursesBar,
} from '~/shared/progress';
import { getTableRowColumnContent } from '~/shared/table';

import style from './style.css';

const selectors = {
  label: style.locals.label,
};

// Get all assignments from course
async function getAssignments(courseId: string) {
  const markingPeriodId = await getActiveMarkingPeriodId();
  const endpoint = '/api/datadirect/GradeBookPerformanceAssignmentStudentList/';
  const query = `?sectionId=${courseId}&markingPeriodId=${markingPeriodId}&studentUserId=4109775`;
  return fetchApi(endpoint + query);
}

// Assigned and due are stored as MM/DD/YY HH:MM PM/AM, displayed as MM/DD
function isEqualDate(longDate: string, shortDate: string) {
  return longDate.startsWith(shortDate);
}

async function getAssignmentPoints(assignmentRow: HTMLElement, assignments: any[]): Promise<number[] | void> {
  const rubric = assignmentHasRubric(assignmentRow);

  if (rubric) {
    const assignmentData = await getAssignmentDataFromRow(assignmentRow);
    if (!assignmentData) {
      return log(
        'error',
        'Cannot match assignment data in letter-grade-points',
        assignmentRow,
      );
    }
    const { rubricPoints, maxPoints } = assignmentData;
    // return
    // if (rubricPoints) {
    //   percentage = computeGradePercentage(rubricPoints, maxPoints);
    // } else {
    //   percentage = letterGradeToPercentage(earned);
    // }
  } else {
    const name = getTableRowColumnContent(assignmentRow, 'Assignment');
    const assigned = getTableRowColumnContent(assignmentRow, 'Assigned');
    const due = getTableRowColumnContent(assignmentRow, 'Due');

    const assignmentData = assignments.find(assignment => {
      console.log(sanitizeAssignmentTitle(assignment.AssignmentShortDescription), name);
      return sanitizeAssignmentTitle(assignment.AssignmentShortDescription) === name
        && isEqualDate(assignment.DateAssigned, assigned)
        && isEqualDate(assignment.DateDue, due);
    });

    if (!assignmentData) {
      return log(
        'error',
        'Cannot match assignment data in letter-grade-points',
        assignmentRow,
      );
    }

    const max = assignmentData.MaxPoints;
    const earned = (max * assignmentData.AssignmentPercentage) / 100;
    return [max, earned];
  }
}

async function generatePointsLabel(earned: number, max: number) {
  const label = (
    <span className={selectors.label}>
      ({earned}/{max})
    </span>
  );

  return label;

}

function isLetterGrade(gradeElem: HTMLElement) {
  const grade = gradeElem.firstChild.textContent;
  return !!grade.toLowerCase().match(/[a-z]/);
}

const domQuery = () => document.querySelectorAll('[data-heading="Points"] h4');

async function insertPoints(unloaderContext: UnloaderContext) {
  console.log('inserting');
  const gradeElems = await waitForOne(domQuery);
  const letterGradeElems = Array.from(gradeElems)
    .filter(isLetterGrade);

  if (!letterGradeElems.length) {
    return;
  }

  const allRubric = Array.from(gradeElems).every(gradeElem => {
    const row = gradeElem.closest('tr');
    return assignmentHasRubric(row);
  });

  if (!allRubric) {
    const openCourseId = getOpenCourseId();
    const assignments = await getAssignments(openCourseId);

    for (const gradeElem of letterGradeElems) {
      const row = gradeElem.closest('tr');
      if (!assignmentHasRubric(row)) {
        const points = await getAssignmentPoints(row, assignments);
        if (!points) {
          continue;
        }
        const [earned, max] = points;
        const label = await generatePointsLabel(earned, max);
        gradeElem.appendChild(label);
        unloaderContext.addRemovable(label);
      } else {
        // const label = await generatePointsLabel(earned, max);
      }
    }
  }


}

async function letterGradePointsMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  addProgressDialogListener(() => {
    insertPoints(unloaderContext);
  }, unloaderContext);
}

export default registerModule('{e8c4fe63-4ca7-4a1b-ac96-3675aa16d3db}', {
  name: 'Letter Grade Points',
  description: 'See the earned and total amount of points on a letter graded assignment',
  main: letterGradePointsMain,
});
