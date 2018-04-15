import { waitForLoad, insertAfter, nodeListToArray } from '../utils/dom';

let classes;
let match;

function generateCourseList() {
  const elems = document.getElementsByClassName('subnav sec-75-bordercolor white-bgc subnav-multicol nav-visible')[0].children;
  return [...nodeListToArray(elems[0].children), ...nodeListToArray(elems[1].children)].filter(e => e.tagName !== 'INPUT');
}

function goToMatch(e) {
  if (e.key === 'Enter' && match) {
    match.children[0].children[0].children[0].click();
  }
}

function handleSearch(e) {
  if (!classes) {
    classes = generateCourseList();
  }
  match = null;
  const matches = classes.filter(course => {
    course.style.opacity = '0.1';
    course.style.background = 'initial';
    // course.style.fontWeight = 'normal';
    course.children[0].children[0].children[0].className = 'title black-fgc';
    course.children[0].children[0].children[0].style.color = 'black';
    course.children[0].style.background = 'initial';
    return course.innerText.toLowerCase().trim().startsWith(e.target.value.toLowerCase());
  });
  matches.forEach(course => {
    course.style.opacity = '1'; // reset style
    course.children[0].children[0].children[0].className = '';
  });
  if (matches.length === 1) {
    matches[0].children[0].style.background = '#d9edf7';
    [match] = matches;
  }
}


function renderSearchBar() {

  const menu = document.getElementsByClassName('subnav sec-75-bordercolor white-bgc subnav-multicol nav-visible')[0];
  const search = document.getElementById('gocp_search-classes-menu_searchbar');
  if (search) {
    search.value = '';
    // search.dispatchEvent(new Event('change'));
    handleSearch({
      target: { value: '' },
    }); // :(
    return search.focus();
  }
  if (!menu) {
    return setTimeout(() => {
      renderSearchBar();
    }, 100);
  }
  const input = document.createElement('input');
  input.id = 'gocp_search-classes-menu_searchbar';
  input.className = 'filter-search-box form-control';
  input.size = '16';
  input.type = 'search';
  input.style.width = '170px';
  input.style.height = '29.6px';
  input.style.display = 'inline';
  input.placeholder = 'Filter Classes';
  let elem = document.getElementsByClassName('subnav sec-75-bordercolor white-bgc subnav-multicol nav-visible')[0].children[0].children[0];
  elem.parentNode.insertBefore(input, elem);
  input.focus();
  document.getElementById('gocp_search-classes-menu_searchbar').oninput = handleSearch;
}

export default function searchClassesMenu() {
  waitForLoad(() => document.getElementById('group-header-Classes')).then(() => {
    document.body.addEventListener('keypress', goToMatch);
    document.getElementsByClassName('twoline parentitem')[0].addEventListener('mouseenter', () => {
      renderSearchBar();
    });
  });
}
