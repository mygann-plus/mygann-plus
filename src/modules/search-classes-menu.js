import { waitForLoad, nodeListToArray, insertBefore } from '../utils/dom';
import { isDesktop } from '../utils/ui';

import registerModule from '../utils/module';

const formats = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
};
const classNames = {
  desktopSearchbar: 'gocp_search-classes-menu_searchbar',
  mobileSearchbar: 'gocp_search-classes-menu_mobile-searchbar',
  desktopClassesMenu: 'subnav sec-75-bordercolor white-bgc subnav-multicol nav-visible',
};

let courses;
let match;
let format = isDesktop() ? formats.DESKTOP : formats.MOBILE;

const getFormat = () => (isDesktop() ? formats.DESKTOP : formats.MOBILE);

const getDesktopCourseElems = () => {
  // TODO: support >2 collumns
  const cols = document.getElementsByClassName(classNames.desktopClassesMenu)[0].children;
  const elems = [
    ...nodeListToArray(cols[0].children).filter(e => e.id !== classNames.desktopSearchbar),
    ...nodeListToArray(cols[1].children),
  ];
  return elems.map(elem => ({
    title: elem.innerText.toLowerCase().trim(),
    elem,
  }));
};
const getMobileCourseElems = () => {
  const elems = document.getElementsByClassName('app-mobile-level')[2].children[2].children;
  return nodeListToArray(elems)
    .filter(e => e.id !== classNames.mobileSearchbar)
    .map(elem => ({
      title: elem.children[0].innerText.toLowerCase().trim(),
      elem,
    }));
};

function generateCourseList() {
  return isDesktop() ? getDesktopCourseElems() : getMobileCourseElems();
}

function hideCourse({ elem }) {
  elem.style.background = 'initial';
  elem.children[0].style.background = 'initial';
  elem.style.opacity = '0.1';
  if (isDesktop()) {
    const text = elem.firstChild.firstChild.firstChild;
    text.className = 'title black-fgc';
    text.style.color = 'black';
  } else {
    elem.children[0].style.textShadow = 'initial';
    elem.children[0].style.color = 'white';
  }
}
function showCourse({ elem }) {
  elem.style.opacity = '1';
  if (isDesktop()) {
    elem.children[0].children[0].children[0].className = '';
  }
}
function highlightCourse({ elem }) {
  elem.children[0].style.background = isDesktop() ? '#d9edf7' : 'rgb(234, 215, 104)';
  if (!isDesktop()) {
    elem.children[0].style.textShadow = 'none';
    elem.children[0].style.color = 'black';
  }
}

function goToMatch(e) {
  if (e.key === 'Enter' && match) {
    if (isDesktop()) {
      match.elem.children[0].children[0].children[0].click();
    } else {
      match.elem.children[0].click();
    }
  }
}

function handleSearch(e) {
  if (!courses || format !== getFormat()) {
    courses = generateCourseList();
  }
  match = null;
  const matches = courses.filter(course => {
    hideCourse(course);
    return course.title.startsWith(e.target.value.toLowerCase());
  });
  matches.forEach(showCourse);
  if (matches.length === 1) {
    highlightCourse(matches[0]);
    [match] = matches;
  }
}

function resetSearchbar(inputElem) {
  inputElem.value = '';
  inputElem.dispatchEvent(new Event('change'));
  handleSearch({
    target: { value: '' },
  });
  inputElem.focus();
}

function renderMobileSearchBar() {

  const search = document.getElementById(classNames.mobileSearchbar);
  if (search) {
    return resetSearchbar(search.firstChild.firstChild);
  }

  const li = document.createElement('li');
  const a = document.createElement('a');
  const input = document.createElement('input');
  li.id = classNames.mobileSearchbar;
  a.className = 'mobile-group-page-link-1';
  input.placeholder = 'Search';
  input.style.background = '#880d2f';
  input.style.color = 'white';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.fontSize = '1.2em';
  a.appendChild(input);
  li.appendChild(a);
  input.oninput = handleSearch;
  document.getElementsByClassName('app-mobile-level')[2].children[2].prepend(li);
  input.focus();
}

function renderDesktopSearchBar() {

  const getClassesMenu = () => document.getElementsByClassName(classNames.desktopClassesMenu)[0];

  const menu = getClassesMenu();
  const search = document.getElementById(classNames.desktopSearchbar);

  if (search) {
    return resetSearchbar(search);
  }
  if (!menu) {
    return setTimeout(() => {
      renderDesktopSearchBar();
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
  input.autocomplete = 'false';
  input.placeholder = 'Filter Classes';
  input.oninput = handleSearch;

  const firstClass = getClassesMenu().firstChild.firstChild;
  insertBefore(firstClass, input);

  input.focus();
}

function searchClassesMenu() {
  document.body.addEventListener('keypress', goToMatch);
  // desktop
  waitForLoad(() => document.getElementById('group-header-Classes')).then(() => {
    document.getElementsByClassName('twoline parentitem')[0].addEventListener('mouseenter', () => {
      renderDesktopSearchBar();
    });
  });
  // mobile
  waitForLoad(() => document.getElementById('mobile-group-header-Classes')).then(() => {
    document.getElementById('mobile-group-header-Classes').addEventListener('click', () => {
      waitForLoad(() => document.getElementsByClassName('app-mobile-level').length)
        .then(renderMobileSearchBar);
    });
  });
}

export default registerModule('Search Classes Menu', searchClassesMenu);
