import classNames from 'classnames';

import registerModule from '~/module';

import {
  waitForLoad,
  constructButton,
  addEventListener,
} from '~/utils/dom';
import { getUserId } from '~/utils/user';
import { fetchApi } from '~/utils/fetch';

import { coursesListLoaded } from '~/shared/progress';

const selectors = {
  button: 'gocp_next-graded-course_button',
  nextGraded: 'gocp_next-graded-course_next-graded',
  prevGraded: 'gocp_next-graded-course_prev-graded',
};

async function selectCourse(course, buttonClassName) {
  course.elem.parentNode.querySelector('.btn.btn-default').click();
  await waitForLoad(() => {
    const headerText = document.querySelector('.bb-dialog-header').textContent.trim();
    return headerText === course.class;
  });
  // refocuses next gradec course button, to allow for continuous entering
  document.querySelector(`.${buttonClassName}`).focus();
}

function generateButton(followingCourse, text, className) {
  const button = constructButton(
    text, '', '',
    () => selectCourse(followingCourse, className),
    classNames(selectors.button, className),
  );
  button.style.color = '';

  if (!followingCourse) {
    button.disabled = true;
    button.classList.add('btn-disabled');
  }
  button.classList.remove('btn-sm');
  return button;
}

const findGraded = currentCourse => course => (
  currentCourse && course.gradedAssignments.length > 0 && course.class !== currentCourse.class
);

function getNextCourse(courses, course) {
  return courses
    .slice(courses.indexOf(course) + 1)
    .find(findGraded(course));
}
function getPreviousCourse(courses, course) {
  const reversedCourses = courses.slice().reverse();
  return getNextCourse(reversedCourses, course);
}

async function addNextGradedCourseButtons(courses, currentCourse, unloaderContext) {
  await waitForLoad(() => document.querySelectorAll('button[data-analysis="next"]').length);

  const nextCourse = getNextCourse(courses, currentCourse);
  const prevCourse = getPreviousCourse(courses, currentCourse);
  const nextGradedButton = generateButton(nextCourse, 'Next Graded Course', selectors.nextGraded);
  const prevGradedButton = generateButton(prevCourse, 'Previous Graded Course', selectors.prevGraded);

  const nextButton = document.querySelectorAll('button[data-analysis="next"]')[0];
  const prevButton = document.querySelectorAll('button[data-analysis="prev"]')[0];
  nextButton.after(nextGradedButton);
  prevButton.before(prevGradedButton);

  unloaderContext.addRemovable(nextGradedButton);
  unloaderContext.addRemovable(prevGradedButton);
}

async function getCourseGradedAssignments(gradeElem) {
  const markingPeriod = document.querySelector('.dropdown-menu .active a').dataset.value;
  const sectionId = gradeElem.nextElementSibling.dataset.analysis;
  const userId = await getUserId();
  const endpoint = '/api/datadirect/GradeBookPerformanceAssignmentStudentList/';
  const query = `?sectionId=${sectionId}&markingPeriodId=${markingPeriod}&studentUserId=${userId}`;
  return fetchApi(endpoint + query);
}

const domQuery = () => (
  coursesListLoaded() &&
  document.querySelector('.btn.btn-default.btn-sm.bold') &&
  document.querySelector('.active')
);

async function nextGradedCourse(opts, unloaderContext) {
  await waitForLoad(domQuery);

  const gradeElemToObject = async e => ({
    grade: e.textContent.trim(),
    class: e.parentNode.parentNode.children[0].children[0].children[0].textContent,
    gradedAssignments: await getCourseGradedAssignments(e),
    elem: e,
  });

  const courses = await Promise.all(Array.from(document.getElementsByClassName('showGrade'))
    .map(gradeElemToObject));

  const reAddButtons = (currentCourse, direction) => {
    const buttons = document.querySelectorAll(`.${selectors.button}`);
    for (const button of buttons) {
      button.remove();
    }
    const followingCourse = courses[courses.indexOf(currentCourse) + direction];
    addNextGradedCourseButtons(courses, followingCourse, unloaderContext);
  };

  for (const course of courses) {
    const gradeDetailButton = course.elem.parentNode.querySelector('.btn.btn-default');
    const gradeDetailListener = addEventListener(gradeDetailButton, 'click', async () => {
      await addNextGradedCourseButtons(courses, course, unloaderContext);

      const nextButton = document.querySelectorAll('button[data-analysis="next"]')[0];
      const prevButton = document.querySelectorAll('button[data-analysis="prev"]')[0];

      unloaderContext.addRemovable(addEventListener(nextButton, 'click', () => reAddButtons(course, 1)));
      unloaderContext.addRemovable(addEventListener(prevButton, 'click', () => reAddButtons(course, -1)));
    });

    unloaderContext.addRemovable(gradeDetailListener);
  }
}

export default registerModule('{82a191dc-db60-475e-ada5-3c966dd36af5}', {
  name: 'Next Graded Course',
  description: 'Button in grade detail to jump to next and previous graded course',
  main: nextGradedCourse,
});

