import { waitForLoad, nodeListToArray, insertAfter, insertCss } from '../utils/dom';
import registerModule from '../utils/module';

const CHECKED_ATTR = 'data-gocp-courses_filter-checked';

let courses;
const filters = [];

function generateCourseList() {
  const rows = document.getElementById('coursesContainer').getElementsByClassName('row');
  return nodeListToArray(rows).map(e => ({
    elem: e,
    name: e.getElementsByTagName('h3')[0].innerText,
    grade: e.getElementsByClassName('showGrade')[0].innerHTML.trim(),
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
  courses.forEach(course => course.elem.setAttribute('data-gocp_courses-filter_hidden', 'true'));
  kept.forEach(course => course.elem.setAttribute('data-gocp_courses-filter_hidden', 'false'));

}

function handleSearch(course) {
  const query = document.getElementById('gocp_courses-search_searchbar').value;
  return course.name.toLowerCase().startsWith(query.toLowerCase());
}
filters.push(handleSearch);

function generateDropdown(items) {

  const wrap = document.createElement('ul');
  wrap.className = 'dropdown-menu';
  wrap.setAttribute('role', 'menu');

  items.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');

    li.setAttribute(CHECKED_ATTR, 'false');
    a.href = '#';
    a.innerText = item.name;

    li.appendChild(a);
    wrap.appendChild(li);

    a.addEventListener('click', e => {
      e.preventDefault();
      const newChecked = li.getAttribute(CHECKED_ATTR) !== 'true';
      li.setAttribute(CHECKED_ATTR, String(newChecked));
      li.className = newChecked ? 'active' : '';
      runFilter();

      const anyChecked = document.querySelectorAll(`li[${CHECKED_ATTR}="true"]`).length > 0;
      const filterButton = document.getElementById('gocp-courses_filter-button');
      filterButton.style.background = anyChecked ? '#1ab394' : 'white';
      filterButton.children[0].style.color = anyChecked ? 'white' : 'black';
    });

    filters.push(course => {
      const checked = li.getAttribute(CHECKED_ATTR) === 'true';
      return checked ? item.filter(course) : true;
    });
  });

  return wrap;
}

function renderFilterBar() {

  // wrap
  const wrap = document.createElement('div');
  wrap.style.display = 'inline';
  wrap.className = 'btn-group';

  // search bar
  const input = document.createElement('input');
  input.id = 'gocp_courses-search_searchbar';
  input.className = 'filter-search-box form-control';
  input.size = '16';
  input.type = 'search';
  input.style.width = '234px';
  input.style.height = '29.6px';
  input.style.display = 'inline';
  input.autocomplete = 'off';
  input.placeholder = 'Search Courses';
  input.oninput = runFilter;

  // dropdown
  const dropdownButton = document.createElement('button');
  const dropdownCaret = document.createElement('i');
  dropdownButton.style.height = '29.6px';
  dropdownButton.style.display = 'inline';
  dropdownButton.style.marginBottom = '3px';
  dropdownButton.style.borderBottomRightRadius = 0;
  dropdownButton.style.borderTopRightRadius = 0;
  dropdownButton.style.boxShadow = 'inset 0 1px 1px rgba(0,0,0,0.075)';
  dropdownButton.style.borderLeft = 'none';
  dropdownButton.style.background = 'white';
  dropdownButton.style.border = '1px solid #e5e6e7';
  dropdownButton.className = 'btn btn-default btn-sm dropdown-toggle';
  dropdownButton.id = 'gocp-courses_filter-button';
  dropdownCaret.className = 'fa fa-ellipsis-h';
  dropdownButton.setAttribute('data-toggle', 'dropdown');
  dropdownButton.setAttribute('area-expanded', false);

  dropdownButton.addEventListener('click', () => {
    const menu = document.getElementById('gocp-courses_filter-button').parentNode.children[0];
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  const dropdownMenu = generateDropdown([
    {
      name: 'Hide Ungraded Courses',
      filter: course => course.grade !== '--&nbsp;&nbsp;',
    },
  ]);

  dropdownButton.appendChild(dropdownCaret);
  wrap.appendChild(dropdownMenu);
  wrap.appendChild(input);
  wrap.appendChild(dropdownButton);

  insertAfter(document.getElementById('showHideGrade'), wrap);
  document.getElementById('showHideGrade').style.marginRight = '15px';

  insertCss(`
    div[data-gocp_courses-filter_hidden="true"] {
      display: none;
    }
  `);
}

const domQuery = () => (
  document.getElementById('coursesContainer') &&
  document.getElementById('coursesContainer').children &&
  document.getElementById('coursesContainer').children.length &&
  document.getElementsByClassName('bb-tile-content-section')[3] &&
  document.getElementsByClassName('bb-tile-content-section')[3].children[0] &&
  document.getElementById('showHideGrade')
);

function coursesFilter() {
  waitForLoad(domQuery).then(renderFilterBar);
}

export default registerModule('Courses Filter', coursesFilter);
