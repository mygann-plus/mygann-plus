import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

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
  hidden: style.locals.hidden,
};

interface Class {
  title: string;
  elem: HTMLElement;
}

// Shifts visible classes to remove gaps caused by hidden list items
function repositionDesktopMenu(menu: HTMLElement, visibleClasses: Class[]) {
  const columns = menu.querySelectorAll('ul');
  const listLength = columns[0].children.length;
  const visibleColumnsCount = Math.ceil(visibleClasses.length / listLength);

  for (let i = 0; i < visibleColumnsCount; i++) {
    const startIndex = i * listLength;
    const endIndex = (i + 1) * listLength;
    const columnClasses = visibleClasses.slice(startIndex, endIndex);
    columns[i].append(...columnClasses.map(c => c.elem));
  }

  const leftoverColumns = Array.from(columns).slice(visibleColumnsCount, -1);
  for (const column of leftoverColumns) {
    column.classList.add(selectors.hidden);
  }
}

function hideClasses(classes: Class[], hiddenKeywords: string[]) {
  const visible = [];
  for (const classObj of classes) {
    const matches = hiddenKeywords.some(c => classObj.title.includes(c));
    if (matches) {
      // classObj.elem.classList.add(selectors.hidden);
      classObj.elem.remove(); // replaced adding the hidden selector with removing because this way the automatic alternate gray/white highlight updates the changes properly
    } else {
      visible.push(classObj);
    }
  }
  return visible;
}

function hideClassesMenu(hiddenKeywords: string[]) {

  waitForLoad(getDesktopMenu).then(menu => {
    const classes = getDesktopCourses();
    const visibleClasses = hideClasses(classes, hiddenKeywords);
    repositionDesktopMenu(menu, visibleClasses);
  });

  waitForLoad(getMobileMenu).then(() => {
    const classes = getMobileCourses();
    hideClasses(classes, hiddenKeywords);
  });

}

const domQuery = {
  progressCourses: () => document.querySelectorAll('#coursesContainer .row'),
};

async function hideProgressPage(hiddenKeywords: string[]) {
  const courseElems = await waitForOne(domQuery.progressCourses);

  const classes = Array.from(courseElems, elem => ({
    title: elem.querySelector('h3').textContent.toLowerCase(),
    elem,
  }));

  hideClasses(classes, hiddenKeywords);
}

async function hideNonacademicClassesMain(
  suboptions: HideNonacademicSuboptions,
  unloaderContext: UnloaderContext,
) {
  const hiddenKeywords = (await fetchNonacademicClasses()).progress;
  const onProgress = window.location.hash === '#studentmyday/progress';
  if (onProgress && suboptions.inProgressPage && hiddenKeywords) {
    hideProgressPage(hiddenKeywords);
    const observer = await observeCoursesBar(() => hideProgressPage(hiddenKeywords));
    unloaderContext.addRemovable(observer);
  }
}

// hide in menu
async function initHideNonacademicClasses(
  suboptions: HideNonacademicSuboptions,
  unloaderContext: UnloaderContext,
) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
  const hiddenKeywords = (await fetchNonacademicClasses()).classesMenu;
  if (hiddenKeywords && suboptions.inClassesMenu) {
    hideClassesMenu(hiddenKeywords);
  }
}

function unloadedHideNonacademicClasses(opts: HideNonacademicSuboptions) {
  if (opts.inClassesMenu) {
    // instead of undoing position recalculation, force reload
    throw new Error('Forcing reload');
  }
  const hidden = document.querySelectorAll(`.${selectors.hidden}`);
  for (const elem of hidden) {
    elem.classList.remove(selectors.hidden);
  }
}

interface HideNonacademicSuboptions {
  inClassesMenu: boolean;
  inProgressPage: boolean;
}

/* eslint-disable max-len */

export default registerModule('{e6bf215e-1286-47e7-baac-d17ec598c4f8}', {
  name: 'Hide Non-Academic Classes',
  description: 'Hides the following non-academic "classes" in the classes menu and the progress page: Lunch, Z\'man Kodesh, Mincha, Special Program, Assembly, Hakhel, Clubs/Lunch, Minyan, Community Service, and Breakfast',
  init: initHideNonacademicClasses,
  main: hideNonacademicClassesMain,
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
