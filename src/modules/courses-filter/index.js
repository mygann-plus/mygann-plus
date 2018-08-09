import classNames from 'classnames';

import createModule from '~/utils/module';

import fuzzyMatch from '~/utils/search';
import colors from '~/utils/colors';
import { createElement, waitForLoad, insertCss, addEventListener } from '~/utils/dom';
import { coursesListLoaded } from '~/shared/progress';

import style from './style.css';

const CHECKED_ATTR = 'data-gocp-courses_filter-checked';

const selectors = {
  hidden: style.locals.hidden,
  filterInput: style.locals['filter-input'],
  dropdownButton: style.locals['dropdown-button'],
};

let courses;
const filters = [];

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

function runFilter() {
  regenerateCoursesList();
  const kept = filters.reduce((arr, filter) => arr.filter(filter), courses);
  // [audit] perhaps use dataset
  courses.forEach(course => course.elem.classList.add(selectors.hidden));
  kept.forEach(course => course.elem.classList.remove(selectors.hidden));
}

function handleSearch(course) {
  const query = document.getElementById('gocp_courses-search_searchbar').value;
  return fuzzyMatch(query, course.name);
}
filters.push(handleSearch);

function generateDropdown(items) {

  const wrap = <ul className="dropdown-menu" role="menu" />;

  items.forEach(item => {
    const a = <a href="#">{ item.name }</a>;
    const li = <li>{ a } </li>;

    li.setAttribute(CHECKED_ATTR, 'false');

    wrap.appendChild(li);

    a.addEventListener('click', e => {
      e.preventDefault();
      const newChecked = li.getAttribute(CHECKED_ATTR) !== 'true';
      li.setAttribute(CHECKED_ATTR, String(newChecked));
      li.className = newChecked ? 'active' : '';
      runFilter();

      const anyChecked = document.querySelectorAll(`li[${CHECKED_ATTR}="true"]`).length > 0;
      const filterButton = document.getElementById('gocp_courses-filter_button');
      filterButton.style.background = anyChecked ? colors.successGreen : 'white';
      filterButton.children[0].style.color = anyChecked ? 'white' : 'black';
    });

    filters.push(course => {
      const checked = li.getAttribute(CHECKED_ATTR) === 'true';
      return checked ? item.filter(course) : true;
    });
  });

  return wrap;
}

function getDropdownMenu() {
  return document.getElementById('gocp_courses-filter_button').parentNode.children[0];
}
function hideDropdownMenu() {
  getDropdownMenu().style.display = 'none';
}
function showDropdownMenu() {
  getDropdownMenu().style.display = 'block';
  document.addEventListener('mousedown', hideDropdownMenu, {
    once: true,
  });
}
function toggleDropdownMenu() {
  const wasShown = getDropdownMenu().style.display === 'block';
  if (wasShown) {
    hideDropdownMenu();
  } else {
    showDropdownMenu();
  }
}

function renderFilterBar() {

  const dropdownFilters = [
    {
      name: 'Hide Ungraded Courses',
      filter: course => course.grade !== '--',
    },
  ];

  // TODO: confirm size prop is needed
  const input = (
    <input
      id="gocp_courses-search_searchbar"
      className={ classNames('form-control', selectors.filterInput) }
      type="search"
      placeholder="Search Courses"
      size="16"
      autocomplete="off"
      onInput={runFilter}
    />
  );

  const dropdownButton = (
    <button
      id="gocp_courses-filter_button"
      className={ classNames('btn btn-default btn-sm dropdown-toggle', selectors.dropdownButton) }
      dataset={{ toggle: 'dropdown' }}
      onClick={ toggleDropdownMenu }
      onMouseDown={ e => e.stopPropagation() }
    >
      <i className="fa fa-ellipsis-h" />
    </button>
  );

  const wrap = (
    <div className="btn-group" style={{ display: 'inline' }}>
      { generateDropdown(dropdownFilters) }
      { input }
      { dropdownButton }
    </div>
  );

  document.getElementById('showHideGrade').after(wrap);
  document.getElementById('showHideGrade').style.marginRight = '15px';

  return wrap;
}

const domQuery = () => (
  coursesListLoaded() &&
  document.getElementById('showHideGrade')
);

async function coursesFilter(opts, unloaderContext) {
  await waitForLoad(domQuery);
  const filterBar = renderFilterBar();
  const styles = insertCss(style.toString());

  unloaderContext.addRemovable(filterBar);
  unloaderContext.addRemovable(styles);
}

function unloadCoursesFilter() {
  const hiddenCourses = document.querySelectorAll(`#courseCollapse .${selectors.hidden}`);
  for (const course of hiddenCourses) {
    course.classList.remove(selectors.hidden);
  }
}

export default createModule('{e2c18d75-5264-4177-97b0-5c6d65fb1496}', {
  name: 'Courses Filter',
  description: 'Search courses and hide ungraded ones.',
  main: coursesFilter,
  unload: unloadCoursesFilter,
});
