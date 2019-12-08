import registerModule from '~/module';

import { createElement, insertCss, waitForOne } from '~/utils/dom';

import {
  addProgressDialogListener,
  getAssignmentDataFromRow,
  assignmentHasRubric,
  letterGradeToPercentage,
} from '~/shared/progress';

import style from './style.css';

const selectors = {
  label: style.locals.label,
};

function getEarnedFromMax(max, letter) {
  const percentage = Math.floor(letterGradeToPercentage(letter));
  return max * (percentage / 100);
}

function isLetter(char) {
  return !!char.toLowerCase().match(/[a-z]/);
}

async function getAssignmentPoints(assignmentRow) {
  const assignment = await getAssignmentDataFromRow(assignmentRow);
  if (!assignment) {
    return; // could not find assignment due to unstripped formatting
  }
  const rubric = assignmentHasRubric(assignmentRow);
  let max = assignment.maxPoints;
  let earned = rubric ? assignment.rubricPoints : getEarnedFromMax(max, assignment.Letter);
  return [earned, max];
}

async function generatePointsLabel(gradeElem) {
  const grade = gradeElem.firstChild.textContent;
  if (!isLetter(grade)) {
    return;
  }

  const assignmentRow = gradeElem.closest('tr');
  const points = await getAssignmentPoints(assignmentRow);
  if (!points) {
    return;
  }
  const [earned, max] = points;

  const label = (
    <span className={selectors.label}>
      ({parseFloat(earned.toFixed(2))}/{max})
    </span>
  );
  return { label, gradeElem };
}

const domQuery = () => document.querySelectorAll('[data-heading="Points"] h4');

async function insertPoints(unloaderContext) {
  const gradeElems = await waitForOne(domQuery);

  const loadingLabels = [];
  for (const gradeElem of gradeElems) {
    if (!document.body.contains(gradeElem)) {
      return; // point elem isn't in body because modal has been switched/closed
    }

    // fetch assignments in parallel
    const labelPromise = generatePointsLabel(gradeElem);
    loadingLabels.push(labelPromise);
  }

  const labels = (await Promise.all(loadingLabels)).filter(Boolean);
  for (const { gradeElem, label } of labels) {
    gradeElem.appendChild(label);
    unloaderContext.addRemovable(gradeElem);
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
