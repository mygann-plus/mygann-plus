import registerModule from '~/module';

import { waitForLoad, insertCss, waitForOne } from '~/utils/dom';
import {
  getDesktopMenu,
  getDesktopCourses,
  getMobileMenu,
  getMobileCourses,
} from '~/shared/classes-menu';
import fetchNonacademicClasses from '~/shared/nonacademic-classes';

import style from './style.css';
import { observeCoursesBar } from '~/shared/progress';

const selectors = {
  hiddenClass: style.locals['hidden-class'],
};

function hideClasses(classes, hiddenKeywords) {
  for (const classObj of classes) {
    const matches = hiddenKeywords.find(c => classObj.title.includes(c));
    if (matches) {
      classObj.elem.classList.add(selectors.hiddenClass);
    }
  }
}

async function hideClassesMenu(hiddenKeywords) {


  waitForLoad(getDesktopMenu).then(() => {
    const classes = getDesktopCourses();
    hideClasses(classes, hiddenKeywords);
  });

  waitForLoad(getMobileMenu).then(() => {
    const classes = getMobileCourses();
    hideClasses(classes, hiddenKeywords);
  });

}

const domQuery = {
  progressCourses: () => document.querySelectorAll('#coursesContainer .row'),
};

async function hideProgressPage(hiddenKeywords) {
  const courseElems = await waitForOne(domQuery.progressCourses);

  const classes = Array.from(courseElems).map(elem => ({
    title: elem.querySelector('h3').textContent.toLowerCase(),
    elem,
  }));

  hideClasses(classes, hiddenKeywords);
}

async function hideNonacademicClasses(suboptions, unloaderContext) {
  const onProgress = window.location.hash === '#studentmyday/progress';
  if (onProgress && suboptions.inProgressPage && hiddenKeywords) {
    const observer = observeCoursesBar(() => hideProgressPage(hiddenKeywords));
    hideProgressPage(hiddenKeywords);
    unloaderContext.addRemovable(observer);
  }
}

// hide in menu
async function initHideNonacademicClasses(suboptions, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
  if (hiddenKeywords && suboptions.inClassesMenu) {
    hideClassesMenu(hiddenKeywords);
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
  init: initHideNonacademicClasses,
  main: hideNonacademicClasses,
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
