import classNames from 'classnames';

import registerModule from '~/module';

import fuzzyMatch from '~/utils/search';
import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import { coursesListLoaded, observeCoursesBar } from '~/shared/progress';

import style from './style.css';

const selectors = {
  hidden: style.locals.hidden,
  filterInput: style.locals['filter-input'],
  selectedCourse: style.locals['selected-course'],
};

let courses;

function generateCourseList() {
  const rows = document.getElementById('coursesContainer').getElementsByClassName('row');
  return Array.from(rows).map(e => ({
    elem: e,
    name: e.querySelector('h3').textContent,
    grade: e.querySelector('.showGrade').textContent.trim(),
  }));
}

function regenerateCoursesList() {
  if (!courses || !document.body.contains(courses[0].elem)) {
    courses = generateCourseList();
  }
}

function handleSearch(course) {
  const query = document.querySelector(`.${selectors.filterInput}`).value;
  return fuzzyMatch(query, course.name);
}

function runFilter() {
  regenerateCoursesList();
  const kept = courses.filter(handleSearch);
  courses.forEach(course => {
    course.elem.classList.add(selectors.hidden);
    course.elem.classList.remove(selectors.selectedCourse);
  });
  kept.forEach(course => course.elem.classList.remove(selectors.hidden));
  if (kept.length === 1) {
    kept[0].elem.classList.add(selectors.selectedCourse);
  }
}


function handleKeyDown(e) {
  if (e.key === 'Enter') {
    regenerateCoursesList();
    const visible = courses.filter(({ elem }) => !elem.classList.contains(selectors.hidden));
    if (visible.length === 1) {
      const { elem } = visible[0];
      const gradeDetailButton = elem.querySelector('.showGrade + .btn');
      gradeDetailButton.click();
    }
  }
}

function renderFilterBar() {

  const input = (
    <input
      className={ classNames('form-control', selectors.filterInput) }
      type="search"
      placeholder="Search Courses"
      autocomplete="off"
      onInput={runFilter}
      onKeyDown={handleKeyDown}
    />
  );

  document.getElementById('showHideGrade').after(input);
  document.getElementById('showHideGrade').style.marginRight = '15px';

  return input;
}

const domQuery = () => (
  coursesListLoaded()
  && document.getElementById('showHideGrade')
);

async function addCoursesFilterBar() {
  await waitForLoad(domQuery);
  const existingFilterBar = document.querySelector(`.${selectors.filterInput}`);
  if (!existingFilterBar) {
    return renderFilterBar();
  }
}

async function coursesFilter(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  let coursesFilterBarUnloader = unloaderContext.addRemovable(await addCoursesFilterBar());

  const coursesBarObserver = await observeCoursesBar(async () => {
    coursesFilterBarUnloader.remove();
    coursesFilterBarUnloader = unloaderContext.addRemovable(await addCoursesFilterBar());
  });
  unloaderContext.addRemovable(coursesBarObserver);

}

function unloadCoursesFilter() {
  const hiddenCourses = document.querySelectorAll(`#courseCollapse .${selectors.hidden}`);
  for (const course of hiddenCourses) {
    course.classList.remove(selectors.hidden);
  }
}

export default registerModule('{e2c18d75-5264-4177-97b0-5c6d65fb1496}', {
  name: 'Courses Filter',
  description: 'Search courses in Progress.',
  main: coursesFilter,
  unload: unloadCoursesFilter,
});
