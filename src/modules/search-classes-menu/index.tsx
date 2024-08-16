/* eslint-disable max-classes-per-file */

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import fuzzyMatch from '~/utils/search';

import { createElement, waitForLoad, insertCss, addEventListener } from '~/utils/dom';
import {
  getDesktopMenu,
  getDesktopCourses,
  getMobileCourses,
  getMobileMenu,
} from '~/shared/classes-menu';

import style from './style.css';

const selectors = {
  desktopSearchbar: style.locals['desktop-search-bar'],
  mobileSearchbar: style.locals['mobile-search-bar'],
  mobileSearchbarWrap: style.locals['mobile-search-bar-wrap'],
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

interface Class {
  title: string;
  elem: HTMLElement;
}

// ESLint doesn't recognize that getCourses is an override
/* eslint-disable class-methods-use-this */

abstract class ClassFilter {

  protected input: HTMLInputElement;
  private match: Class;
  private hiddenClassName: string;
  private highlightedClassName: string;

  constructor(inputId: string, hiddenClassName: string, highlightedClassName: string) {
    this.input = (
      <input
        id={inputId}
        type="search"
        placeholder="Search Classes"
      />
    ) as HTMLInputElement;

    this.input.addEventListener('input', () => this.handleSearch());
    this.input.addEventListener('keypress', e => this.handleKeypress(e));
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
    const courses = this.getCourses();
    for (const course of courses) {
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
    } else {
      this.match = null;
    }
  }

  handleKeypress(e: KeyboardEvent) {
    if (this.match && e.key === 'Enter') {
      this.goToMatch();
    }
  }

  goToMatch() {
    this.match.elem.querySelector('a').click();
  }

  setCourseShown(elem: HTMLElement, isShown: boolean) {
    elem.classList.toggle(this.hiddenClassName, !isShown);
  }

  setCourseHighlighted(elem: HTMLElement, isHighlighted: boolean) {
    elem.classList.toggle(this.highlightedClassName, isHighlighted);
  }

  // Overridden by DesktopClassFilter and MobileClassFilter
  abstract getCourses(): Class[];

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
    return getDesktopCourses()
      .filter(({ elem }) => {
        return elem.id !== selectors.desktopSearchbar && !elem.closest('.subnavfooter');
      });
  }

  mountInput(node: HTMLElement) {
    node.prepend(this.input);
  }

  remove() {
    this.input.remove();
  }
}

class MobileClassFilter extends ClassFilter {

  private wrap: HTMLElement;

  constructor() {
    super(
      selectors.mobileSearchbar,
      selectors.hiddenCourse.mobile,
      selectors.highlightedCourse.mobile,
    );
  }

  getCourses() {
    return getMobileCourses()
      .filter(({ elem }) => elem.id !== selectors.mobileSearchbarWrap);
  }

  mountInput(node: HTMLElement) {
    this.wrap = (
      <li id={selectors.mobileSearchbarWrap}>
        <span className="mobile-group-page-link-1">{ this.input }</span>
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
  mobile: getMobileMenu,
};

function searchClassesMenuMain(opts: void, unloaderContext: UnloaderContext) {
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

  // I don't know what this is for. Why mobile? This isn't visible on mobile. Also why is it different from the desktop one? Why do we want this in the first place? It's not even functional cause it's adding the listener to a null element. I'm commenting this out.
  // waitForLoad(domQuery.mobile).then(() => {
  //   const classFilter = new MobileClassFilter();
  //   classFilter.mountInput(domQuery.mobile());
  //   unloaderContext.addRemovable(classFilter);
  //
  //   const classesMenu = document.querySelector('#mobile-group-header-Classes');
  //   const showListener = addEventListener(classesMenu, 'click', () => {
  //     classFilter.showSearchbar();
  //   });
  //   unloaderContext.addRemovable(showListener);
  // });
}

export default registerModule('{3eb98c28-475a-43d7-ae80-721fffcdda11}', {
  name: 'Search Classes Menu',
  init: searchClassesMenuMain,
});
