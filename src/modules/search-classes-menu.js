import { waitForLoad, createElementFromHTML, insertCss } from '../utils/dom';

import registerModule from '../utils/module';
import colors from '../utils/colors';

const selectors = {
  desktopSearchbar: 'gocp_search-classes-menu_searchbar',
  mobileSearchbarWrap: 'gocp_search-classes-menu_mobile-searchbar-wrap',
  mobileSearchbar: 'gocp_search-classes-menu_mobile-searchbar',
  hiddenCourse: {
    desktop: 'gocp_search-classes-menu_hidden-course-mobile',
    mobile: 'gocp_search-classes-menu_hidden-course-mobile',
  },
  highlightedCourse: {
    desktop: 'gocp_search-classes-menu_highlighted-course-desktop',
    mobile: 'gocp_search-classes-menu_highlighted-course-mobile',
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
    this.input = createElementFromHTML(`
      <input 
        id="${inputId}"
        class="form-control"
        type="search"
        autocomplete="off"
        placeholder="Filter Classes"
      >
    `);
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
      const isMatched = course.title.includes(this.getCurrentSearch());
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
      title: elem.innerText.toLowerCase().trim(),
      elem,
    }));
  }
  mountInput(node) {
    node.prepend(this.input);
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
    const wrapHtml = `
      <li id="${selectors.mobileSearchbarWrap}">
        <a class="mobile-group-page-link-1"></a>
      </li>
    `;
    const wrap = createElementFromHTML(wrapHtml);
    wrap.querySelector('a').appendChild(this.input);
    node.prepend(wrap);
  }
}

/* eslint-enable class-methods-use-this */

function addStyles() {
  insertCss(`
    #group-header-Classes + * + .subnav {
      /* Move search bar up */
      padding-top: 1px !important;
    }
    #${selectors.mobileSearchbar} {
      background: #880d2f;
      color: white;
      border: none;
      outline: none;
      font-size: 1.2em;
    }
    .${selectors.hiddenCourse.desktop}, .${selectors.hiddenCourse.mobile} {
      opacity: 0.1;
    }
    .${selectors.highlightedCourse.mobile} a {
      /* text-shadow and color override more specific native selectors */
      text-shadow: none !important;
      color: black !important;
      background: rgb(234, 215, 104);
    }
    .${selectors.highlightedCourse.desktop} a {
      background: ${colors.lightBlue};
    }
    `);
}

const domQuery = {
  desktop: getDesktopMenu,
  mobile: () => (
    document.querySelectorAll('.app-mobile-level')[2] &&
    document.querySelectorAll('.app-mobile-level')[2].children[2]
  ),
};

let moduleLoaded = false;

function searchClassesMenu() {
  if (moduleLoaded) return;
  moduleLoaded = true;

  addStyles();

  // desktop
  waitForLoad(domQuery.desktop).then(() => {
    const classFilter = new DesktopClassFilter();
    classFilter.mountInput(getDesktopMenu());

    const classesMenu = document.querySelector('#group-header-Classes').parentNode;
    classesMenu.addEventListener('mouseenter', () => {
      classFilter.showSearchbar();
    });
  });

  // mobile
  waitForLoad(domQuery.mobile).then(() => {
    const classFilter = new MobileClassFilter();
    classFilter.mountInput(domQuery.mobile());
    document.querySelector('#mobile-group-header-Classes').addEventListener('click', () => {
      classFilter.showSearchbar();
    });
  });
}

export default registerModule('Search Classes Menu', searchClassesMenu);
