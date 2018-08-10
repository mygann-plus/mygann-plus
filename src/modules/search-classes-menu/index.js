import createModule from '~/utils/module';
import fuzzyMatch from '~/utils/search';

import { createElement, waitForLoad, insertCss, addEventListener } from '~/utils/dom';

import style from './style.css';

const selectors = {
  desktopSearchbar: 'gocp_search-classes-menu_searchbar',
  mobileSearchbarWrap: 'gocp_search-classes-menu_mobile-searchbar-wrap',
  mobileSearchbar: style.locals['mobile-search-bar'],
  hiddenCourse: {
    desktop: style.locals['hidden-course-desktop'],
    mobile: style.locals['hidden-course-mobile'],
  },
  highlightedCourse: {
    desktop: style.locals['highlighted-course-desktop'],
    mobile: style.locals['highlighted-course-mobile'],
  },
  desktopClassesMenu: 'subnav',
};

const getDesktopMenu = () => (
  document.querySelector(`#group-header-Classes + * + .${selectors.desktopClassesMenu}`)
);

// ESLint doesn't recognize that getCourses is an override
/* eslint-disable class-methods-use-this */

class ClassFilter {

  constructor(inputId, hiddenClassName, highlightedClassName) {
    this.input = <input
        id={inputId}
        className="form-control"
        type="search"
        autocomplete="off"
        placeholder="Filter Classes"
      />;

    this.input.addEventListener('input', () => this.handleSearch());
    this.input.addEventListener('keypress', e => this.handleKeypress(e));
    this.courses = this.getCourses();
    this.match = null;

    this.hiddenClassName = hiddenClassName;
    this.highlightedClassName = highlightedClassName;
  }
  showSearchbar() {
    this.input.value = '';
    this.handleSearch();
    this.input.focus();
  }
  getCurrentSearch() {
    return this.input.value.toLowerCase().trim();
  }

  handleSearch() {
    const matches = [];
    for (const course of this.courses) {
      const isMatched = fuzzyMatch(this.getCurrentSearch(), course.title);
      if (isMatched) {
        matches.push(course);
      }
      this.setCourseShown(course.elem, isMatched);
      this.setCourseHighlighted(course.elem, false);
    }

    if (matches.length === 1) {
      this.match = matches[0]; // eslint-disable-line prefer-destructuring
      this.setCourseHighlighted(this.match.elem, true);
    }
  }

  handleKeypress(e) {
    if (this.match && e.key === 'Enter') {
      this.goToMatch();
    }
  }
  goToMatch() {
    this.match.elem.querySelector('a').click();
  }

  setCourseShown(elem, isShown) {
    elem.classList.toggle(this.hiddenClassName, !isShown);
  }

  setCourseHighlighted(elem, isHighlighted) {
    elem.classList.toggle(this.highlightedClassName, isHighlighted);
  }
}

class DesktopClassFilter extends ClassFilter {
  constructor() {
    super(
      selectors.desktopSearchbar,
      selectors.hiddenCourse.desktop,
      selectors.highlightedCourse.desktop,
    );
  }

  getCourses() {
    const cols = getDesktopMenu().children;
    const elems = [];
    for (const col of cols) {
      if (col.matches('.subnavfooter')) {
        continue;
      }
      elems.push(...Array.from(col.children).filter(child => {
        return !child.matches(`.divider, #${selectors.desktopSearchbar}`);
      }));
    }

    return elems.map(elem => ({
      title: elem.textContent.toLowerCase().trim(),
      elem,
    }));
  }
  mountInput(node) {
    node.prepend(this.input);
  }
  remove() {
    this.input.remove();
  }
}

class MobileClassFilter extends ClassFilter {
  constructor() {
    super(
      selectors.mobileSearchbar,
      selectors.hiddenCourse.mobile,
      selectors.highlightedCourse.mobile,
    );
  }
  getCourses() {
    const elems = Array.from(document.querySelectorAll('.app-mobile-level')[2].children[2].children);
    elems.splice(elems.length - 1, 1);
    return Array.from(elems)
      .filter(e => e.id !== selectors.mobileSearchbarWrap)
      .map(elem => ({
        title: elem.firstElementChild.textContent.toLowerCase().trim(),
        elem,
      }));
  }
  mountInput(node) {
    this.wrap = (
      <li id={selectors.mobileSearchbarWrap}>
        <a className="mobile-group-page-link-1">{ this.input }</a>
      </li>
    );
    node.prepend(this.wrap);
  }
  remove() {
    this.wrap.remove();
  }
}

/* eslint-enable class-methods-use-this */

const domQuery = {
  desktop: getDesktopMenu,
  mobile: () => (
    document.querySelectorAll('.app-mobile-level')[2] &&
    document.querySelectorAll('.app-mobile-level')[2].children[2]
  ),
};

function searchClassesMenu(opts, unloaderContext) {
  insertCss(style.toString());

  waitForLoad(domQuery.desktop).then(() => {
    const classFilter = new DesktopClassFilter();
    classFilter.mountInput(getDesktopMenu());
    unloaderContext.addRemovable(classFilter);

    const classesMenu = document.querySelector('#group-header-Classes').parentNode;
    const showListener = addEventListener(classesMenu, 'mouseenter', () => {
      classFilter.showSearchbar();
    });
    unloaderContext.addRemovable(showListener);
  });

  waitForLoad(domQuery.mobile).then(() => {
    const classFilter = new MobileClassFilter();
    classFilter.mountInput(domQuery.mobile());
    unloaderContext.addRemovable(classFilter);

    const classesMenu = document.querySelector('#mobile-group-header-Classes');
    const showListener = addEventListener(classesMenu, 'click', () => {
      classFilter.showSearchbar();
    });
    unloaderContext.addRemovable(showListener);
  });
}

export default createModule('{3eb98c28-475a-43d7-ae80-721fffcdda11}', {
  name: 'Search Classes Menu',
  init: searchClassesMenu,
});
