import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

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

interface Course {
  grade: string;
  class: string;
  gradedAssignments: any;
  elem: HTMLElement;
}

async function selectCourse(course: Course, buttonClassName: string) {
  (course.elem.parentNode.querySelector('.btn.btn-default') as HTMLElement).click();
  await waitForLoad(() => {
    const headerText = document.querySelector('.bb-dialog-header').textContent.trim();
    return headerText === course.class;
  });
  // refocuses next graded course button, to allow for continuous entering
  const button = document.querySelector(`.${buttonClassName}`) as HTMLButtonElement;
  button.focus();
}

function generateButton(followingCourse: Course, text: string, className: string) {
  const button = constructButton({
    textContent: text,
    onClick: () => selectCourse(followingCourse, className),
    className: classNames(selectors.button, className),
  });
  button.style.color = '';

  if (!followingCourse) {
    button.disabled = true;
    button.classList.add('btn-disabled');
  }
  button.classList.remove('btn-sm');
  return button;
}

const findGraded = (currentCourse: Course) => (course: Course) => (
  currentCourse && course.gradedAssignments.length > 0 && course.class !== currentCourse.class
);

function getNextCourse(courses: Course[], course: Course) {
  return courses
    .slice(courses.indexOf(course) + 1)
    .find(findGraded(course));
}
function getPreviousCourse(courses: Course[], course: Course) {
  const reversedCourses = courses.slice().reverse();
  return getNextCourse(reversedCourses, course);
}

async function addNextGradedCourseButtons(
  courses: Course[],
  currentCourse: Course,
  unloaderContext: UnloaderContext,
) {
  await waitForLoad(() => document.querySelectorAll('button[data-analysis="next"]').length);

  const nextCourse = getNextCourse(courses, currentCourse);
  const prevCourse = getPreviousCourse(courses, currentCourse);

  const nextGradedButton = generateButton(
    nextCourse,
    'Next Graded Course',
    selectors.nextGraded,
  );
  const prevGradedButton = generateButton(
    prevCourse,
    'Previous Graded Course',
    selectors.prevGraded,
  );

  const nextButton = document.querySelectorAll('button[data-analysis="next"]')[0];
  const prevButton = document.querySelectorAll('button[data-analysis="prev"]')[0];
  nextButton.after(nextGradedButton);
  prevButton.before(prevGradedButton);

  unloaderContext.addRemovable(nextGradedButton);
  unloaderContext.addRemovable(prevGradedButton);
}

// Is course full year, not semester
function isFullYearCourse(sectionId: number, coursesContext: any) {
  const course = coursesContext.find((c: any) => (
    c.CurrentSectionId === sectionId
  ));
  // if course is full-year, there will two courses with same SectionId
  const otherSemesterCourse = coursesContext.find((c: any) => (
    c.SectionId === course.SectionId && c.CurrentSectionId !== course.CurrentSectionId
  ));
  return !!otherSemesterCourse;
}

async function getCourseGradedAssignments(gradeElem: HTMLElement, coursesContext: any) {
  const selectedSemesterElem = document.querySelector('.dropdown-menu .active a') as HTMLElement;
  const isSecondSemester = selectedSemesterElem.textContent.includes('2');

  const markingPeriod = selectedSemesterElem.dataset.value;
  let sectionId = Number((gradeElem.nextElementSibling as HTMLElement).dataset.analysis);
  if (isSecondSemester) {
    const fullYear = isFullYearCourse(sectionId, coursesContext);
    if (fullYear) {
      // during second semester, full-year ids are one less than in DOM for unknown reason
      sectionId = Number(sectionId) - 1;
    }
  }
  const userId = await getUserId();
  const endpoint = '/api/datadirect/GradeBookPerformanceAssignmentStudentList/';
  const query = `?sectionId=${sectionId}&markingPeriodId=${markingPeriod}&studentUserId=${userId}`;
  return fetchApi(endpoint + query);
}

const domQuery = () => (
  coursesListLoaded()
  && document.querySelector('.btn.btn-default.btn-sm.bold')
  && document.querySelector('.active')
);

async function nextGradedCourseMain(opts: void, unloaderContext: UnloaderContext) {
  await waitForLoad(domQuery);

  // List of all courses
  const coursesContext = (await fetchApi('/api/webapp/context')).Groups;

  const gradeElemToObject = async (e: HTMLElement) => ({
    grade: e.textContent.trim(),
    class: e.parentNode.parentNode.children[0].children[0].children[0].textContent,
    gradedAssignments: await getCourseGradedAssignments(e, coursesContext),
    elem: e,
  });

  const courses = await Promise.all(Array.from(document.getElementsByClassName('showGrade'))
    .map(gradeElemToObject));

  const reAddButtons = (currentCourse: Course, direction: number) => {
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

      const nextListener = addEventListener(nextButton, 'click', () => reAddButtons(course, 1));
      const prevListener = addEventListener(prevButton, 'click', () => reAddButtons(course, -1));
      unloaderContext.addRemovable(nextListener);
      unloaderContext.addRemovable(prevListener);
    });

    unloaderContext.addRemovable(gradeDetailListener);
  }
}

export default registerModule('{82a191dc-db60-475e-ada5-3c966dd36af5}', {
  name: 'Next Graded Course',
  description: 'Button in grade detail to jump to next and previous graded course',
  main: nextGradedCourseMain,
});
