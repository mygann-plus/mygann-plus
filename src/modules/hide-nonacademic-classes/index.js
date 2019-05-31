import registerModule from '~/module';

import { waitForLoad, insertCss, waitForOne } from '~/utils/dom';
import {
  getDesktopMenu,
  getDesktopCourses,
  getMobileMenu,
  getMobileCourses,
} from '~/shared/classes-menu';
import HIDDEN_KEYWORDS from '~/shared/nonacademic-classes';

import style from './style.css';

const selectors = {
  hiddenClass: style.locals['hidden-class'],
};

function hideClasses(classes) {
  for (const classObj of classes) {
    const matches = HIDDEN_KEYWORDS.find(c => classObj.title.includes(c));
    if (matches) {
      classObj.elem.classList.add(selectors.hiddenClass);
    }
  }
}

async function hideClassesMenu() {


  waitForLoad(getDesktopMenu).then(() => {
    const classes = getDesktopCourses();
    hideClasses(classes);
  });

  waitForLoad(getMobileMenu).then(() => {
    const classes = getMobileCourses();
    hideClasses(classes);
  });

}

const domQuery = {
  progressCourses: () => document.querySelectorAll('#coursesContainer .row'),
};

async function hideProgressPage() {
  const courseElems = await waitForOne(domQuery.progressCourses);

  const classes = Array.from(courseElems).map(elem => ({
    title: elem.querySelector('h3').textContent.toLowerCase(),
    elem,
  }));

  hideClasses(classes);
}

async function hideNonacademicClasses(suboptions, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  if (window.location.hash === '#studentmyday/progress' && suboptions.inProgressPage) {
    hideProgressPage();
  }
  if (suboptions.inClassesMenu) {
    hideClassesMenu();
  }
}

function unloadedHideNonacademicClasses() {
  const hiddenClasses = document.querySelectorAll(`.${selectors.hiddenClass}`);
  for (const classElem of hiddenClasses) {
    classElem.classList.remove(selectors.hiddenClass);
  }
}

/* eslint-disable max-len */

export default registerModule('{e6bf215e-1286-47e7-baac-d17ec598c4f8}', {
  name: 'Hide Non-Academic Classes',
  description: 'Hides the following non-academic "classes" in the classes menu and the progress page: Lunch, Z\'man Kodesh, Mincha, Special Program, Assembly, Hakhel, Clubs/Lunch, Minyan, Community Service, and Breakfast',
  init: hideNonacademicClasses,
  unload: unloadedHideNonacademicClasses,
  suboptions: {
    inClassesMenu: {
      name: 'Hide in Classes Menu',
      type: 'boolean',
      defaultValue: true,
    },
    inProgressPage: {
      name: 'Hide in Progress Page',
      type: 'boolean',
      defaultValue: true,
    },
  },
});

/* eslint-enable max-len */
