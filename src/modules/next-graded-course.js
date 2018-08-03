import registerModule from '~/utils/module';
import {
  waitForLoad,
  createElementFromHTML,
} from '~/utils/dom';
import { coursesListLoaded } from '~/shared/progress';

function selectCourse({ elem }) {
  elem.parentNode.querySelector('.btn.btn-default').click();
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

const domQuery = () => (
  coursesListLoaded() &&
  document.querySelector('.btn.btn-default.btn-sm.bold')
);

async function nextGradedCourse() {
  await waitForLoad(domQuery);

  const gradeElemToObject = e => ({
    grade: e.textContent.trim(),
    class: e.parentNode.parentNode.children[0].children[0].children[0].textContent,
    elem: e,
  });

  const courses = Array.from(document.getElementsByClassName('showGrade'))
    .map(gradeElemToObject);

  for (const course of courses) {
    course.elem.parentNode
      .querySelector('.btn.btn-default')
      .addEventListener('click', async () => {
        await waitForLoad(() => document.querySelectorAll('button[data-analysis="next"]').length);
        const nextCourses = getNextCourse(courses, course);
        const prevCourses = getPreviousCourse(courses, course);
        const nextGradedButton = generateButton(nextCourses, 'forward');
        const prevGradedButton = generateButton(prevCourses, 'backward');

        const nextButton = document.querySelectorAll('button[data-analysis="next"]')[0];
        const prevButton = document.querySelectorAll('button[data-analysis="prev"]')[0];
        nextButton.after(nextGradedButton);
        prevButton.before(prevGradedButton);
      });
  }
}

export default registerModule('Next Graded Course', nextGradedCourse);

