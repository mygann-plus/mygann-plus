import { waitForLoad, constructButton, nodeListToArray } from '../utils/dom';

function letterGradeFromNumber(num) {
  const number = Number(num.split('%')[0]);
  const map = {
    90: 'A',
    80: 'B',
    70: 'C',
    60: 'D',
  };
  let letter = 'F';
  for (let i in map) {
    if (number > i) {
      letter = map[i];
      let ones = number - i;
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
    grade: e.innerText.trim(),
    class: e.parentNode.parentNode.children[0].children[0].children[0].innerText,
  });
  const formatGradeObject = e => {
    const className = e.class.split('-')[0].trim();
    const fullGrade = `${e.grade} (${letterGradeFromNumber(e.grade)})`;
    return `${className}: ${fullGrade}`;
  };
  const removeEmptyGrade = e => e.grade !== '--';

  document.getElementsByClassName('btn btn-default btn-sm bold')[0].click();

  const gradesString = nodeListToArray(document.getElementsByClassName('showGrade'))
    .map(gradeElemToObject)
    .filter(removeEmptyGrade)
    .map(formatGradeObject)
    .join('\n');

  document.getElementsByClassName('btn btn-default btn-sm bold')[1].click();
  alert(`Your grade summary:\n\n${gradesString}`); // eslint-disable-line no-alert

}

const DOM_QUERY = () => (
  document.getElementById('coursesContainer') &&
  document.getElementById('coursesContainer').children &&
  document.getElementById('coursesContainer').children.length &&
  document.getElementsByClassName('bb-tile-content-section')[3] &&
  document.getElementsByClassName('bb-tile-content-section')[3].children[0]
);

export default function gradeSummary() {
  // TODO: Options
  waitForLoad(DOM_QUERY).then(() => {
    const button = constructButton('Grade Summary', '', '', generateReport);
    button.className += ' pull-right';
    const wrap = document.getElementById('courses').children[0].children[0].children[1].children[0];
    wrap.children[0].children[0].appendChild(button);
  });
}
