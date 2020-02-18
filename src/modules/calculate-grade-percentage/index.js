import registerModule from '~/module';

import { createElement, waitForOne, insertCss } from '~/utils/dom';
import {
  computeGradePercentage,
  addProgressDialogListener,
  getAssignmentDataFromRow,
  assignmentHasRubric,
  letterGradeToPercentage,
} from '~/shared/progress';

import style from './style.css';

const selectors = {
  percentage: style.locals.percentage,
};

const domQuery = {
  gradeDetailButton: () => document.querySelectorAll('.col-md-2 .btn'),
  pointWraps: () => document.querySelectorAll('[data-heading="Points"]'),
  prevButton: () => document.querySelectorAll('button[data-analysis="prev"]')[0],
  nextButton: () => document.querySelectorAll('button[data-analysis="next"]')[0],
};

function isLetterGrade(pointElem) {
  return !!pointElem.textContent.match(/[A-F]/);
}

function createPercentageLabel(percentage) {
  return (
    <span className={selectors.percentage}>
      { percentage }%
    </span>
  );
}

async function insertPercentages() {
  const pointWraps = await waitForOne(domQuery.pointWraps);
  const existingPercentages = document.querySelectorAll(`.${selectors.percentage}`);
  if (existingPercentages.length) {
    return;
  }

  for (const pointWrap of pointWraps) {
    const pointElem = pointWrap.querySelector('h4');

    const [earned, total] = pointElem.textContent.split('/');
    const letter = isLetterGrade(pointElem);

    let percentage;
    if (!letter) {
      percentage = computeGradePercentage(earned, total);
    } else {
      const assignmentRow = pointElem.closest('tr');
      const rubric = assignmentHasRubric(assignmentRow);
      if (rubric) {
        const assignmentData = await getAssignmentDataFromRow(assignmentRow);
        if (!assignmentData) {
          continue;
        }
        const { rubricPoints, maxPoints } = assignmentData;
        if (rubricPoints) {
          percentage = computeGradePercentage(rubricPoints, maxPoints);
        } else {
          percentage = letterGradeToPercentage(earned);
        }
      } else {
        percentage = letterGradeToPercentage(earned);
      }
    }

    const percentageElem = createPercentageLabel(percentage);
    pointElem.after(percentageElem);
  }
}

async function calculateGradePercentage(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  addProgressDialogListener(insertPercentages, unloaderContext);
}

async function unloadCalculateGradePercentage() {
  const percentages = document.querySelectorAll(`.${selectors.percentage}`);
  for (const percentage of percentages) {
    percentage.remove();
  }
}

export default registerModule('{896c2bee-bcb9-4d9b-8edd-5c6b6a01df22}', {
  name: 'Calculate Grade Percentage',
  description: 'Show the percentage next to assignment grades in progress',
  main: calculateGradePercentage,
  unload: unloadCalculateGradePercentage,
});
