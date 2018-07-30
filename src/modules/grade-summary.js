import registerModule from '../utils/module';
import { waitForLoad, constructButton, nodeListToArray, createElementFromHTML } from '../utils/dom';
import Dialog from '../utils/dialogue';

function letterGradeFromNumber(num) {
  const number = Number(num.split('%')[0]);
  const map = {
    90: 'A',
    80: 'B',
    70: 'C',
    60: 'D',
  };
  let letter = 'F';
  for (const grade in map) {
    if (number > grade) {
      letter = map[grade];
      const ones = number - grade;
      if (ones >= 7) {
        letter += '+';
      } else if (ones < 3 && ones >= 0) {
        letter += '-';
      }
    }
  }
  return letter;
}

function generateReport() {

  const gradeElemToObject = e => ({
    grade: e.textContent.trim(),
    class: e.parentNode.parentNode.children[0].children[0].children[0].textContent,
  });
  const formatGradeObject = e => {
    const className = e.class.split('-')[0].trim();
    const fullGrade = `${e.grade} (${letterGradeFromNumber(e.grade)})`;
    return `${className}: ${fullGrade}`;
  };
  const removeEmptyGrade = e => e.grade !== '--';

  const gradesString = Array.from(document.querySelectorAll('.showGrade'))
    .map(gradeElemToObject)
    .filter(removeEmptyGrade)
    .map(formatGradeObject)
    .join('<br />') || 'No graded courses yet.';

  // span is necessary for multiple courses
  const dialogElem = createElementFromHTML(`<span>${gradesString}</span>`);

  const dialog = new Dialog('Grade Summary', dialogElem, {
    buttons: [Dialog.buttons.OKAY],
  });
  dialog.open();

}

const domQuery = () => (
  document.querySelector('#coursesContainer > *') &&
  document.querySelectorAll('.bb-tile-content-section')[3] &&
  document.querySelectorAll('.bb-tile-content-section')[3].children[0]
);

const getCoursesBar = () => (
  document.querySelector(`#courses > :first-child > :first-child > :nth-child(2)
    > :first-child > :first-child > :first-child`)
);

async function gradeSummary() {
  await waitForLoad(domQuery);

  const button = constructButton(
    'Grade Summary',
    'gocp_grade-summary_button',
    '',
    generateReport,
  );
  button.className += ' pull-right';
  getCoursesBar().appendChild(button);
}

export default registerModule('Grade Summary', gradeSummary);
