import registerModule from '../utils/module';
import {
  waitForLoad,
  nodeListToArray,
  insertAfter,
  insertBefore,
  createElementFromHTML,
} from '../utils/dom';

const DOM_QUERY = () => (
  document.getElementById('coursesContainer') &&
  document.getElementById('coursesContainer').children &&
  document.getElementById('coursesContainer').children.length &&
  document.getElementsByClassName('bb-tile-content-section')[3] &&
  document.getElementsByClassName('bb-tile-content-section')[3].children[0] &&
  document.getElementsByClassName('btn btn-default btn-sm bold')[0]
);

function selectCourse({ elem }) {
  elem.parentNode.getElementsByClassName('btn btn-default')[0].click();
}

function generateButton(followingCourse, icon) {
  const btnHtml = `
    <button class="btn btn-default">
      <i style="color: ##4d4d4d;" class="fa fa-fast-${icon}"></i>
    </button>
  `;
  const button = createElementFromHTML(btnHtml);
  if (!followingCourse) {
    button.classList.add('disabled');
  } else {
    // "following" refers both to next and previous
    button.addEventListener('click', () => selectCourse(followingCourse));
  }
  return button;
}

function getNextCourse(courses, course) {
  return courses
    .slice(courses.indexOf(course) + 1, course.length)
    .find(c => c.grade !== '--');
}
function getPreviousCourse(courses, course) {
  const reversedCourses = courses.slice().reverse();
  return getNextCourse(reversedCourses, course);
}

function nextGradedCourse() {
  waitForLoad(DOM_QUERY)
    .then(() => {

      const gradeElemToObject = e => ({
        grade: e.textContent.trim(),
        class: e.parentNode.parentNode.children[0].children[0].children[0].innerText,
        elem: e,
      });

      const courses = nodeListToArray(document.getElementsByClassName('showGrade'))
        .map(gradeElemToObject);

      courses.forEach(course => {
        course.elem.parentNode
          .getElementsByClassName('btn btn-default')[0]
          .addEventListener('click', () => {
            waitForLoad(() => document.querySelectorAll('button[data-analysis="next"]').length)
              .then(() => {
                const nextCourses = getNextCourse(courses, course);
                const prevCourses = getPreviousCourse(courses, course);
                const nextGradedButton = generateButton(nextCourses, 'forward');
                const prevGradedButton = generateButton(prevCourses, 'backward');

                const nextButton = document.querySelectorAll('button[data-analysis="next"]')[0];
                const prevButton = document.querySelectorAll('button[data-analysis="prev"]')[0];
                insertAfter(nextButton, nextGradedButton);
                insertBefore(prevButton, prevGradedButton);
              });
          });
      });

    });
}

export default registerModule('Next Graded Course', nextGradedCourse);

