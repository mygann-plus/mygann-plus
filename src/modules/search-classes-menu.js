import { waitForLoad, insertAfter, nodeListToArray } from '../utils/dom';
import registerModule from '../utils/module';

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

function renderMobileSearchBar() {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'mobile-group-page-link-1';
  const input = document.createElement('input');
  input.placeholder = 'Search';
  input.style.background = '#880d2f';
  input.style.color = 'white';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.fontSize = '1.2em';
  a.appendChild(input);
  li.appendChild(a);
  return li;
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

function searchClassesMenu() {
  waitForLoad(() => document.getElementById('group-header-Classes')).then(() => {
    document.body.addEventListener('keypress', goToMatch);
    document.getElementsByClassName('twoline parentitem')[0].addEventListener('mouseenter', () => {
      renderSearchBar();
    });
  });
  // waitForLoad(() => document.getElementById('site-mobile-sitenav').children[0].children.length > 1).then(() => {
  //   document.getElementById('site-mobile-sitenav').children[0].prepend(renderMobileSearchBar());
  // });

  waitForLoad(() => document.getElementById('mobile-group-header-Classes') && document.getElementsByClassName('app-mobile-level').length).then(() => {
    console.log(document.getElementById('mobile-group-header-Classes').parentNode);
    document.getElementById('mobile-group-header-Classes').parentNode.addEventListener('click', e => {
      console.log(e.target);
      console.log(document.getElementById('mobile-group-header-Classes').parentNode);
      alert(1);
      document.getElementsByClassName('app-mobile-level open')[0].children[2].prepend(renderMobileSearchBar());
    });
  });
}

export default registerModule('Search Classes Menu', searchClassesMenu);
