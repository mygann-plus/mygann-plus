import { waitForLoad, nodeListToArray, insertAfter } from '../utils/dom';

let courses;

const DOM_QUERY = () => (
  document.getElementById('coursesContainer') &&
  document.getElementById('coursesContainer').children &&
  document.getElementById('coursesContainer').children.length &&
  document.getElementsByClassName('bb-tile-content-section')[3] &&
  document.getElementsByClassName('bb-tile-content-section')[3].children[0] &&
  document.getElementById('showHideGrade')
);

function generateCourseList() {
  const rows = document.getElementById('coursesContainer').getElementsByClassName('row');
  return nodeListToArray(rows).map(e => ({
    elem: e,
    name: e.getElementsByTagName('h3')[0].innerText,
  }));
}

function handleSearch(e) {
  if (!courses || !document.body.contains(courses[0].elem)) {
    courses = generateCourseList();
  }
  courses.forEach(course => {
    course.elem.style.display = 'block'; // reset style
    if (!course.name.toLowerCase().startsWith(e.target.value.toLowerCase())) {
      course.elem.style.display = 'none';
    }
  });
}

function renderSearchBar() {

  const input = document.createElement('input');
  input.id = 'gocp_courses-search_searchbar';
  input.className = 'filter-search-box form-control';
  input.size = '16';
  input.type = 'search';
  input.style.width = '234px';
  input.style.height = '29.6px';
  input.style.display = 'inline';
  input.placeholder = 'Filter Courses';

  insertAfter(document.getElementById('showHideGrade'), input);
  document.getElementById('showHideGrade').style.marginRight = '15px';
  courses = generateCourseList();
  document.getElementById('gocp_courses-search_searchbar').oninput = handleSearch;
}

export default function coursesSearch() {
  waitForLoad(DOM_QUERY)
    .then(renderSearchBar);
}
