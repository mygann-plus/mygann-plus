import { waitForLoad, nodeListToArray, insertAfter } from '../utils/dom';
import registerModule from '../utils/module';

const DOM_QUERY = () => (
  document.getElementById('coursesContainer') &&
  document.getElementById('coursesContainer').children &&
  document.getElementById('coursesContainer').children.length &&
  document.getElementsByClassName('bb-tile-content-section')[3] &&
  document.getElementsByClassName('bb-tile-content-section')[3].children[0] &&
  document.getElementsByClassName('btn btn-default btn-sm bold')[0]
);

function selectGrade(elem) {
  elem.parentNode.getElementsByClassName('btn btn-default')[0].click();
}

function generateButton(grades, grade, direction, directionWord, dataAnalysis) {
  let nextCourseElem;
  const btn = document.createElement('button');
  btn.innerText = `${directionWord} Graded Course`;
  btn.className = 'btn btn-default';
  for (let i = grades.indexOf(grade) + direction; i < grades.length; i += direction) {
    if (grades[i] && grades[i].grade !== '--' && !nextCourseElem) {
      nextCourseElem = grades[i].elem;
    }
  }
  if (!nextCourseElem) {
    btn.className += ' disabled';
  }
  btn.addEventListener('click', () => {
    selectGrade(nextCourseElem);
  });
  return btn;
}

function nextGradedCourse() {
  waitForLoad(DOM_QUERY)
    .then(() => {

      const gradeElemToObject = e => ({
        grade: e.innerText.trim(),
        class: e.parentNode.parentNode.children[0].children[0].children[0].innerText,
        elem: e,
      });
      document.getElementsByClassName('btn btn-default btn-sm bold')[0].click();
      // TODO: tell if grades are already shown.
      // Also for grade-summary
      const grades = nodeListToArray(document.getElementsByClassName('showGrade'))
        .map(gradeElemToObject);

      grades.forEach(grade => {
        grade.elem.parentNode.getElementsByClassName('btn btn-default')[0].addEventListener('click', () => {
          waitForLoad(() => document.querySelectorAll('button[data-analysis="next"]').length)
            .then(() => {
              const next = generateButton(grades, grade, 1, 'Next', 'next');
              // const prev = generateButton(grades, grade, -1, 'Previous', 'prev');

              insertAfter(
                document.querySelectorAll('button[data-analysis="next"]')[0],
                next,
              );
              // document.querySelectorAll('button[data-analysis="prev"]')[0].insertBefore(prev);
            });
        });
      });

    });
}

export default registerModule('Next Graded Course', nextGradedCourse);

